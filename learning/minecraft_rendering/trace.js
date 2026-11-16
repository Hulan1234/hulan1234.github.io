// Each entry is a Mojang-mapped method or an explicit scheduling/data boundary.
const before19 = v => versions.indexOf(v) < versions.indexOf("1.19");
const earlyTerrain = v => v === "1.16.5" || v === "1.17.1";
const method = (id, explanation, when = () => true) => ({ id, explanation, when });

const traces = [
  {
    sections: [
      ["客户端 · 本地放置", [
        method("Minecraft.startUseItem", "使用键命中方块时，把命中的 BlockHitResult 和手交给游戏模式。"),
        method("MultiPlayerGameMode.useItemOn", "1.16.5–1.18.2：接收 ClientLevel。命中方块未消耗交互且物品可用时，发送 ServerboundUseItemOnPacket，并在客户端调用 ItemStack.useOn。", before19),
        method("MultiPlayerGameMode.useItemOn", "1.19 起：发起带序号的预测，委托给 startPrediction。", v => !before19(v)),
        method("MultiPlayerGameMode.startPrediction", "打开 BlockStatePredictionHandler.startPredicting 的作用域；运行 PredictiveAction 并通过 ClientPacketListener.send 发送带序号的 ServerboundUseItemOnPacket。", v => !before19(v)),
        method("MultiPlayerGameMode.performUseItemOn", "命中方块未消耗交互且物品可用时，构造 UseOnContext，调用 ItemStack.useOn。", v => !before19(v)),
        method("ItemStack.useOn", "把上下文交给物品实例的 useOn；持有石头时动态分派到 BlockItem。"),
        method("BlockItem.useOn", "构造 BlockPlaceContext 并调用 place。"),
        method("BlockItem.place", "检查放置条件，经 getPlacementState 得到目标状态，再调用 placeBlock。"),
        method("BlockItem.placeBlock", "在目标位置调用 Level.setBlock(pos, state, 11)。"),
        method("ClientLevel.setBlock", "四参数覆写在预测中先调用 super.setBlock；成功后调用 retainKnownServerState 保存可用于校正的旧状态。", v => !before19(v)),
        method("Level.setBlock", "三参数入口转到四参数入口；写入 LevelChunk，按标志触发变化通知。"),
        method("LevelChunk.setBlockState", "在目标区段内写入 BlockState（区段存储），向 Level 返回旧状态。")
      ]],
      ["客户端 · 渲染失效通知", [
        method("Level.setBlock", "客户端在符合状态变化和标志条件时，经 sendBlockUpdated 进入 ClientLevel。Level.setBlock 也可能经另一个 setBlocksDirty 通知路径标记重绘。"),
        method("ClientLevel.sendBlockUpdated", "将位置、前后状态和标志转交 LevelRenderer.blockChanged。"),
        method("LevelRenderer.blockChanged", "此入口调用 setBlockDirty(BlockPos, boolean)，将 flags & 8 的结果作为布尔值传入。"),
        method("LevelRenderer.setBlockDirty:BlockPos,boolean", "枚举方块周围 ±1 的位置，换算区段坐标并调用带布尔参数的 setSectionDirty。独立的 BlockState 重载用于另一条通知路径。"),
        method("LevelRenderer.setSectionDirty:int,int,int,boolean", "把受影响的区段坐标交给 ViewArea，线程仍在客户端侧。"),
        method("ViewArea.setDirty", "按区段坐标查找对应 RenderChunk，调用它的 setDirty。"),
        method("ChunkRenderDispatcher$RenderChunk.setDirty", "设置 dirty，并记录是否属于需优先处理的玩家变化；此时尚未产生顶点。")
      ]]
    ],
    side: ["联机对照 · 服务端权威状态如何回来", [
      method("ServerGamePacketListenerImpl.handleUseItemOn", "ServerboundUseItemOnPacket 的处理器。校验交互后调用 ServerPlayerGameMode.useItemOn；向操作者回送命中位置和相邻位置的方块状态。"),
      method("ServerPlayerGameMode.useItemOn", "服务端的放置路径同样可到 ItemStack.useOn → BlockItem.placeBlock → Level.setBlock。"),
      method("ServerLevel.sendBlockUpdated", "服务端写入后通知 ServerChunkCache.blockChanged，并由 ChunkHolder 记录要广播的变化。"),
      method("ChunkHolder.broadcastChanges", "向追踪区块的客户端同步区段变化；单个位置可用 ClientboundBlockUpdatePacket，多个位置可合并。"),
      method("ClientPacketListener.handleBlockUpdate", "先用 PacketUtils.ensureRunningOnSameThread 切入客户端执行，再交给 ClientLevel。"),
      method("ClientLevel.setKnownState", "1.16.5–1.18.2：单方块更新走 setKnownState，再走 Level.setBlock。", before19),
      method("ClientLevel.setServerVerifiedBlockState", "1.19 起：有未确认预测则先更新缓存的服务端状态，否则直接用 super.setBlock 应用。", v => !before19(v)),
      method("ClientPacketListener.handleBlockChangedAck", "1.19 起：ClientboundBlockChangedAckPacket 传回确认序号。ClientLevel.handleBlockChangedAck 把序号转交预测处理器。", v => !before19(v)),
      method("BlockStatePredictionHandler.endPredictionsUpTo", "清理已确认的预测条目，并调用 ClientLevel.syncBlockState。", v => !before19(v)),
      method("ClientLevel.syncBlockState", "本地状态与权威值有差异时重新走 setBlock；状态已一致时可以复用已构建的网格。", v => !before19(v))
    ]]
  },
  {
    sections: [["渲染线程调度 → CPU 编译", [
      method("GameRenderer.renderLevel", "建立相机与投影参数后调用 LevelRenderer.renderLevel。"),
      method("LevelRenderer.renderLevel", "帧渲染调用 setupRender，随后调用本版的编译调度方法。dirty 标记在这里被消费。"),
      method("LevelRenderer.setupRender", "准备地形可见性相关状态；编译调度所处理的区段来自这一渲染流程。"),
      method("LevelRenderer.compileChunksUntil", "1.16.5–1.17.1：排空上传工作，在时间预算内从待重建集合提交 dirty 区段。", earlyTerrain),
      method("LevelRenderer.compileChunks", "从视锥内的区段选择 dirty 且客户端光照已就绪的区段；按优先级选同步或异步路径，并在渲染侧排空上传队列。", v => !earlyTerrain(v)),
      method("ChunkRenderDispatcher$RenderChunk.rebuildChunkAsync", "调用 createCompileTask 组装 RebuildTask，再调用 dispatcher.schedule。"),
      method("ChunkRenderDispatcher.schedule", "经 dispatcher 的执行队列登记任务；随后触发 runTask。"),
      method("ChunkRenderDispatcher.runTask", "取待编译任务和空闲 ChunkBufferBuilderPack，用 executor 执行任务的 doTask；完成后回收或清理 pack。"),
      method("ChunkRenderDispatcher$RenderChunk$RebuildTask.doTask", "检查取消及邻区段条件，再调用 compile 生成这一版的 CPU 网格。")
    ]]],
    side: ["断点落在同步重建时", [
      method("ChunkRenderDispatcher.rebuildChunkSync", "优先更新分支跳过 schedule，直接转交 RenderChunk.compileSync。"),
      method("ChunkRenderDispatcher$RenderChunk.compileSync", "仍然调用 createCompileTask 和同一个 RebuildTask.doTask，使用 dispatcher 的固定构建器包。")
    ]]
  },
  { sections: [["任务创建时准备区域 → 任务执行时读区域", [
    method("ChunkRenderDispatcher$RenderChunk.createCompileTask", "取消旧任务，以区段原点至 origin.offset(15, 15, 15) 为目标范围，创建区域并交给 RebuildTask。"),
    method("RenderChunkRegion.createIfNotEmpty", "1.16.5–1.17.1：旧版区域工厂在 RenderChunkRegion 内。", earlyTerrain),
    method("RenderRegionCache.createRegion", "1.18.2 起的对照版本：用带周边余量的区块范围准备视图；目标范围为空时可返回 null。", v => !earlyTerrain(v)),
    method("ChunkRenderDispatcher$RenderChunk$RebuildTask.compile", "当前任务取出自己的 region，用 BlockPos.betweenClosed 遍历目标区段；区域视图还会传给后续方块和光照查询。"),
    method("RenderChunkRegion.getBlockState", "通过区域视图读取当前位置和邻居，给区段编译以及方向面剔除提供输入。")
  ]]] },
  { sections: [["区段循环 → 普通模型渲染", [
    method("ChunkRenderDispatcher$RenderChunk$RebuildTask.compile", "读出 BlockState，通过 getRenderShape 筛掉不可见方块，再选择该块的地形 layer。"),
    method("ItemBlockRenderTypes.getChunkRenderType", "原版石头进入 RenderType.solid()。"),
    method("ChunkBufferBuilderPack.builder", "按 RenderType 返回 builder。首次遇到该层，由 RenderChunk.beginLayer 初始化。"),
    method("PoseStack.translate:double,double,double", "在 pushPose / popPose 之间按区段内坐标平移，三个分量可用世界坐标 & 15 得到。", v => v !== "1.19.3" && v !== "1.19.4"),
    method("PoseStack.translate", "在 pushPose / popPose 之间按区段内坐标平移，三个分量可用世界坐标 & 15 得到。", v => v === "1.19.3" || v === "1.19.4"),
    method("BlockRenderDispatcher.renderBatched", "MODEL 路径调用 getBlockModel，把模型、状态、视图、随机源、位置种子和顶点消费者传入 tesselateBlock。")
  ]]] },
  { sections: [["从状态取模型 → 向模型取面", [
    method("BlockRenderDispatcher.getBlockModel", "由 renderBatched 调用，转给 BlockModelShaper。"),
    method("BlockModelShaper.getBlockModel", "按 BlockState 查表，找不到时回退到缺失模型。"),
    method("ModelBlockRenderer.tesselateBlock", "之前取到的 BakedModel 作为参数传进来；随后选择 AO 或平面光照分支。"),
    method("BakedModel.getQuads", "光照分支按每个 Direction 和 null 查询候选 BakedQuad；调用前以该位置的种子重设随机源。")
  ]]] },
  { sections: [["可见性、光照与顶点提交", [
    method("ModelBlockRenderer.tesselateBlock", "综合环境光遮蔽设置、发光和模型属性，进 tesselateWithAO 或 tesselateWithoutAO。"),
    method("ModelBlockRenderer.tesselateWithAO", "AO 路径向模型取面，检查邻面并通过 renderModelFaceAO 计算四个顶点的光照。"),
    method("ModelBlockRenderer.tesselateWithoutAO", "平面路径也取面并做邻面检查，调用 renderModelFaceFlat。"),
    method("Block.shouldRenderFace", "方向面列表非空且启用邻面检查时，查询相邻方块的遮挡形状。direction=null 的通用面走独立提交。"),
    method("ModelBlockRenderer.putQuadData", "两条光照分支最终汇聚到这里；若该面有 tint，再查询 BlockColors.getColor。"),
    method("VertexConsumer.putBulkData", "以 PoseStack.Pose 处理位置和法线，结合颜色与 lightmap，把一个 BakedQuad 打散为顶点。")
  ]]] },
  { sections: [["区段的 solid 批次如何收到顶点", [
    method("ChunkRenderDispatcher$RenderChunk.beginLayer", "首次遇到该区段的 solid 层时调用 BufferBuilder.begin，地形采用 DefaultVertexFormat.BLOCK。"),
    method("BufferBuilder.begin", "开始区段的该层批次。旧版用整数 GL 模式，后续版用 VertexFormat.Mode.QUADS。"),
    method("VertexConsumer.putBulkData", "每个面将顶点属性写入该批次；实际接收者是 BufferBuilder。"),
    method("BufferBuilder.vertex", "接收转换后的坐标、颜色、UV、光照和法线；顶点写完后走 endVertex。"),
    method("BufferBuilder.endVertex", "提交当前顶点并推进批次计数。单个方块结束后，批次仍可接收后续方块。"),
    method("BufferBuilder.end", "1.16.5–1.18.2：编译循环在每层结束时调用 end，完成后的批次仍由 builder 持有。", before19),
    method("BufferBuilder.endOrDiscardIfEmpty", "1.19 起：区段遍历结束后，各用过的层分别收尾。非空层的结果以 RenderedBuffer 放进 CompileResults.renderedLayers。", v => !before19(v))
  ]]] },
  { sections: [["上传队列 → OpenGL 缓冲", [
    method("ChunkRenderDispatcher$RenderChunk$RebuildTask.doTask", "编译完成后，对每个需要上传的层取得 RenderChunk.getBuffer，再提交 uploadChunkLayer。任务完成回调发布新的 compiled 状态。"),
    method("ChunkRenderDispatcher.uploadChunkLayer", "将上传工作放进 toUpload 队列，返回 CompletableFuture；旧版参数是 BufferBuilder，新版是 RenderedBuffer。"),
    method("ChunkRenderDispatcher.uploadAllPendingUploads", "渲染侧轮询队列并运行 Runnable。异步 CPU 编译完成与 GPU 上传是两个时点。"),
    method("ChunkRenderDispatcher.doUploadChunkLayer", "旧版 continuation 经此方法调用 VertexBuffer.upload。", before19),
    method("VertexBuffer.upload", "旧版进入 upload_，从 BufferBuilder.popNextBuffer 取出顶点/绘制状态并上传。", before19),
    method("BufferBuilder.popNextBuffer", "交出旧版已经 end 的一批 CPU 数据。", before19),
    method("VertexBuffer.upload", "上传 runnable 绑定区段 VBO；upload 调用 uploadVertexBuffer、uploadIndexBuffer，并在结束后 release RenderedBuffer。", v => !before19(v)),
    method("VertexBuffer.uploadVertexBuffer", "绑定 OpenGL 顶点缓冲并上传顶点数据。", v => !before19(v)),
    method("VertexBuffer.uploadIndexBuffer", "solid 使用顺序索引缓冲；需要显式索引时可上传该批次的索引数据。", v => !before19(v)),
    method("RenderSystem.glBufferData", "经 Blaze3D 转交 GlStateManager._glBufferData。"),
    method("GlStateManager._glBufferData:int,ByteBuffer,int", "调用 OpenGL 的 glBufferData 写入已绑定的 GPU 缓冲。")
  ]]] },
  { sections: [["绘制可见区段的 solid 层 → OpenGL draw", [
    method("LevelRenderer.renderLevel", "世界渲染这一帧明确调用 renderChunkLayer(RenderType.solid(), …)。"),
    method("LevelRenderer.renderChunkLayer", "建立 solid 层渲染状态，获取视野内区段，检查层有无可绘制数据。"),
    method("ShaderInstance.apply", "1.17.1 起：层级 shader 在区段循环前生效；循环里再为各区段更新偏移。", v => v !== "1.16.5"),
    method("ChunkRenderDispatcher$CompiledChunk.isEmpty", "检查该区段的 compiled 结果中是否包含 solid 层；空层跳过。"),
    method("ChunkRenderDispatcher$RenderChunk.getBuffer", "取出这一层已经上传的 VertexBuffer，再用区段原点减相机位置得到摆放偏移。"),
    method("VertexBuffer.draw", "1.16.5：传入含区段偏移的矩阵和原始绘制模式。", v => v === "1.16.5"),
    method("RenderSystem.drawArrays", "1.16.5：使用顶点数提交非索引绘制。", v => v === "1.16.5"),
    method("GlStateManager._drawArrays", "经 OpenGL glDrawArrays 提交非索引绘制。", v => v === "1.16.5"),
    method("VertexBuffer.drawChunkLayer", "1.17.1–1.18.2：直接走地形层绘制入口，再提交索引绘制。", v => v !== "1.16.5" && before19(v)),
    method("VertexBuffer.draw", "1.19 起：各区段直接 bind / draw，层结束后 unbind。", v => !before19(v)),
    method("RenderSystem.drawElements", "1.17.1 起：由 VertexBuffer 将绘制模式、索引类型与索引数量交给 Blaze3D。", v => v !== "1.16.5"),
    method("GlStateManager._drawElements", "经 OpenGL glDrawElements 提交索引绘制。", v => v !== "1.16.5")
  ]]] }
];
