const versions = ["1.16.5","1.17.1","1.18.2","1.19.2","1.19.3","1.19.4"];
const renderer = "net/minecraft/client/renderer/";
const chunk = renderer + "chunk/";
const task = chunk + "ChunkRenderDispatcher$RenderChunk$RebuildTask";
const renderChunk = chunk + "ChunkRenderDispatcher$RenderChunk";
const dispatcher = chunk + "ChunkRenderDispatcher";
const vertex = "com/mojang/blaze3d/vertex/";
const lessons = [
{
name:"标记区段 dirty", title:"方块状态变化，区段被标记 dirty", phase:"客户端 · 失效标记",
lead:"场景固定为视野内的普通石头。追踪客户端应用方块状态、收到渲染更新通知，到受影响的 16×16×16 区段被标记的一次过程。",
chain:["Level.sendBlockUpdated","ClientLevel.sendBlockUpdated","LevelRenderer.blockChanged","LevelRenderer.setBlockDirty","ViewArea.setDirty","RenderChunk.setDirty"],
detail:"放置成功之后，客户端可以先应用本地预测状态，也可能随后收到服务端修正。在 blockChanged 路径里，渲染器按方块位置周围的范围标记受影响区段。边界处，邻区段里的方块也可能要重新决定是否显示贴着新石头的面。标记本身只改变后续调度所见的状态。",
sources:[["通知入口", "net/minecraft/client/multiplayer/ClientLevel"],["区段范围 · blockChanged / setBlockDirty",renderer+"LevelRenderer"],["区段查找 · setDirty",renderer+"ViewArea"],["dirty 标志 · setDirty",renderChunk]],
diff:["从 ClientLevel.sendBlockUpdated 进 LevelRenderer.blockChanged；跟踪相邻区段以及 ViewArea 的旧高度网格。","通知链可以从同名方法进入；查看 ViewArea.setDirty 的区段坐标换算。","新世界高度下，区段 Y 索引还需要结合世界最低区段。阅读 ViewArea 时，区分世界区段坐标和数组索引。","用 LevelRenderer.blockChanged 作为共同入口。预测和服务端确认的上游变化不影响这条定位方式。","依旧可从 blockChanged → ViewArea.setDirty 下断点，检查方块绝对坐标与区段坐标。","同样跟踪 blockChanged 到 ViewArea.setDirty，避免把整个 LevelChunk（区块列）当成一个待重建网格。"],
code:"// 将通知范围里的一个方块坐标换算成区段坐标\nint sectionX = SectionPos.blockToSectionCoord(pos.getX());\nint sectionY = SectionPos.blockToSectionCoord(pos.getY());\nint sectionZ = SectionPos.blockToSectionCoord(pos.getZ());\nviewArea.setDirty(sectionX, sectionY, sectionZ, urgent);",
q:"在区段边界放置石头，为什么相邻区段也可能变 dirty？",
choices:["邻区段已有方块的面剔除结果可能改变。","因为每次放置都会同步重新上传全世界的 VBO。","因为 dirty 只记录哪个实体需要重新绘制。"], answer:0,
why:"区段分别保存网格数据。边界的遮挡关系变化，需要让受影响的邻区段重新生成自己的顶点。"
},
{
name:"创建重建任务",title:"LevelRenderer 调度区段重建",phase:"调度 · 编译任务",
lead:"下一次地形更新处理可见区段时，dirty 状态变成一次实际的编译请求。",
chain:["LevelRenderer.compileChunks","RenderChunk.rebuildChunkAsync","RenderChunk.createCompileTask","ChunkRenderDispatcher.schedule","RebuildTask.doTask"],
detail:"沿异步分支读：渲染器选中需要重建的可见区段，RenderChunk 创建任务并交给 dispatcher。dispatcher 调度任务并提供用于写顶点的 ChunkBufferBuilderPack。源码还有同步重建路径；调试时先检查本次实际进入的是哪个分支。旧任务可能被取消，不能把一次 schedule 等同于一次成功上传。",
sources:[["可见区段调度",renderer+"LevelRenderer"],["任务创建 · createCompileTask",renderChunk],["任务队列 · schedule",dispatcher],["任务执行 · doTask",task]],
diff:["旧调度队列和运行器在 ChunkRenderDispatcher 中定位；跟踪 RenderChunk 的异步入口和前台重建入口。","查看高低优先级任务与缓存参数；用 createCompileTask 定位构造 RebuildTask 的位置。","从 compileChunks 入手，沿可见区段与优先级选择走到任务提交处。","旧任务取消和新建任务都在 RenderChunk 中查；留意待上传工作与待编译任务是两组工作。","任务结构保留；为断点过滤区段位置，避免被周围区段的并行重建淹没。","从 createCompileTask 进入 RebuildTask.doTask；同步分支可能绕过异步排队。"],
code:"// 以较新版本异步分支为例，在 RenderChunk 内观察\nChunkCompileTask job = createCompileTask(regionCache);\ndispatcher.schedule(job);",
q:"一次 setDirty(true) 后，网格立刻重建完了吗？",
choices:["是，setDirty 会直接在 GPU 上提交绘制。","否，任务随后由地形更新挑选和调度。","是，网络线程会直接填入该区段的 VertexBuffer。"],answer:1,
why:"dirty 是待更新标记。调度、CPU 编译、上传和绘制有各自的执行边界。"
},
{
name:"RenderChunkRegion",title:"为编译准备邻近方块的读取视图",phase:"CPU · 区域数据",
lead:"创建编译任务时准备 RenderChunkRegion。执行编译时遍历目标区段，查询周围状态也通过这份区域视图。",
chain:["RenderChunk.createCompileTask","RenderRegionCache.createRegion","RenderChunkRegion","RebuildTask.compile","region.getBlockState"],
detail:"区段内部是生成网格的遍历范围。准备区域数据时会覆盖周边，以支持例如可见面、环境光遮蔽和亮度查询。构建任务持有 region，把它作为 BlockAndTintGetter 传给方块渲染。关注读取视图与目标网格的范围区别，也要允许任务拿到空区域。",
sources:[["区域准备 · createCompileTask",renderChunk],["区域缓存 · createRegion",chunk+"RenderRegionCache"],["读取视图 · getBlockState",chunk+"RenderChunkRegion"],["消费区域 · compile",task]],
diff:["创建入口位于 RenderChunkRegion.createRegion；本版定位时直接打开区域类。","查 RenderRegionCache.createRegion；区域与缓存的责任拆分。","查 RenderRegionCache 与 RenderChunkRegion；世界高度变化也影响区段原点计算。","仍沿 createRegion 找到 task 的 region，检查 getBlockState 与邻居查询。","创建和读取仍各有入口；从 RenderChunk.createCompileTask 检查传入区段边界。","RenderRegionCache 建区域，RenderChunkRegion 提供查询；在 doTask/compile 区分何时取出、何时释放任务引用。"],
code:"// 编译阶段只遍历目标区段；region 还可读周边\nBlockState state = region.getBlockState(pos);\nBlockState adjacent = region.getBlockState(pos.relative(Direction.EAST));",
q:"重建区段时为什么还需要读取区段之外的一圈数据？",
choices:["用来提前加载下一帧所有纹理。","要替相邻区段也写一份完整网格。","判断边界面的可见性和光照需要读取邻居。"],answer:2,
why:"输出属于目标区段，面剔除与光照等输入可以来自周边。"
},
{
name:"BlockRenderDispatcher",title:"按方块状态进入模型渲染分支",phase:"CPU · 方块分派",
lead:"RebuildTask.compile 遍历每个方块位置，选出地形 render layer，并把普通模型方块交给 BlockRenderDispatcher。",
chain:["RebuildTask.compile","ItemBlockRenderTypes.getChunkRenderType","BlockRenderDispatcher.renderBatched","BlockRenderDispatcher.getBlockModel","ModelBlockRenderer.tesselateBlock"],
detail:"区段编译负责遍历位置、选择层，以及提供该层的 BufferBuilder。renderBatched 接收当前 BlockState、位置、区域、PoseStack、输出对象、检查邻面标志和随机源，进入 MODEL 路径后，再将烘焙模型传给 ModelBlockRenderer。石头在原版会进入 solid 层。",
sources:[["遍历与分层 · compile",task],["renderBatched / getBlockModel",renderer+"block/BlockRenderDispatcher"],["地形层 · getChunkRenderType",renderer+"ItemBlockRenderTypes"]],
diff:["renderBatched 看 java.util.Random 及本版输出参数签名。","同样在 renderBatched 找模型分支，检视结果写入哪个 layer 的 builder。","renderBatched 的随机参数仍是 java.util.Random。","随机参数为 net.minecraft.util.RandomSource；旧版断点与 Mixin 描述符不可直接复制。","保持 RandomSource；查本版实际方法描述符。","RandomSource 传给 tesselateBlock；用原版方法签名核对本地模组环境。"],
code:"// 在编译循环里，state 是石头的 BlockState\nRenderType layer = ItemBlockRenderTypes.getChunkRenderType(state);\nBufferBuilder builder = builders.builder(layer);\nblockRenderer.renderBatched(state, pos, region, poseStack, builder, true, random);",
q:"普通石头应写进哪个地形层由谁在这条链上选择？",
choices:["BakedModel.getQuads 在 GPU 上选择。","编译循环通过 ItemBlockRenderTypes.getChunkRenderType 选择。","VertexBuffer 在 upload 后检查纹理文件名选择。"],answer:1,
why:"编译循环先按层取 builder，再调用 renderBatched 追加方块几何。"
},
{
name:"BakedModel",title:"从 BlockState 取到烘焙模型",phase:"CPU · 模型输入",
lead:"BlockRenderDispatcher 用 BlockState 找到资源加载期已经烘焙好的模型，然后把它传给 ModelBlockRenderer。",
chain:["BlockRenderDispatcher.getBlockModel","BlockModelShaper.getBlockModel","ModelBlockRenderer.tesselateBlock","BakedModel.getQuads"],
detail:"烘焙模型是可查询的几何输入。ModelBlockRenderer 查询按方向分组的面，也会查询 direction 为 null 的通用面。按方向分组的面在边界检查通过时才写出；通用面的含义是没有归入某个待检查的剔除方向。放置石头会重新编译地形区段，资源模型无需随每次放置重新烘焙。",
sources:[["模型查找 · getBlockModel",renderer+"block/BlockRenderDispatcher"],["状态到模型 · getBlockModel",renderer+"block/BlockModelShaper"],["模型接口 · getQuads","net/minecraft/client/resources/model/BakedModel"]],
diff:["getQuads 使用 java.util.Random；追踪状态到模型的映射。","仍使用 java.util.Random；关注 direction=null 的查询。","用 getBlockModel 跟踪当前 BlockState 对应的烘焙模型。","getQuads 使用 RandomSource；自定义模型的覆写签名需要对应版本。","getQuads 保持 RandomSource，原版接口用方向参数区分方向面与通用面。","getQuads 保持 RandomSource；检查邻面的是消费模型的渲染器。"],
code:"BakedModel model = blockRenderer.getBlockModel(state);\nrandom.setSeed(state.getSeed(pos));\nList<BakedQuad> northFaces = model.getQuads(state, Direction.NORTH, random);",
q:"玩家每放一块普通石头，地形重建从哪里获得它的模型？",
choices:["按 BlockState 查找已烘焙的模型。","从服务器包读取完整的 BakedQuad 列表。","在这一帧重新解析和烘焙全部模型 JSON。"],answer:0,
why:"资源加载提供 BakedModel。地形编译负责从模型挑选并写出当前地点需要的四边形。"
},
{
name:"ModelBlockRenderer",title:"处理可见面与光照，提交四边形顶点",phase:"CPU · 网格生成",
lead:"同一个 BakedModel 放到不同位置，会因为邻居、光照和着色条件而生成不同的顶点数据。",
chain:["tesselateBlock","tesselateWithAO / tesselateWithoutAO","BakedModel.getQuads","VertexConsumer.putBulkData","BufferBuilder"],
detail:"ModelBlockRenderer 选择环境光遮蔽或平面光照分支。它对方向面应用侧面检查，为选中的四边形计算亮度、颜色等输入，再通过 VertexConsumer 写入本层 builder。编译阶段的 PoseStack 将方块放到区段内的局部位置，最终绘制时再由区段位置定位。",
sources:[["tesselateBlock / tesselateWithAO / tesselateWithoutAO",renderer+"block/ModelBlockRenderer"],["putBulkData",vertex+"VertexConsumer"]],
diff:["AO 与平面路径可在 ModelBlockRenderer 里分别跟踪；随机参数用 Random。","对比 AO 和平面路径的四边形提交，使用本版签名。","相同模型分支；注意区段的局部坐标和世界坐标用途不同。","随机源换成 RandomSource；AO/平面仍是定位入口。","沿 tesselateBlock 对照本版的参数和提交入口。","区段写入仍经过两种光照分支，跟踪 VertexConsumer 的实际对象 BufferBuilder。"],
code:"// 教学摘写，表达方向面检查，不展开光照计算\nBlockPos neighbor = pos.relative(face);\nif (!checkSides || Block.shouldRenderFace(state, region, pos, face, neighbor)) {\n    List<BakedQuad> quads = model.getQuads(state, face, random);\n    // 原版对这些 quads 计算光照，然后用 putBulkData 写顶点。\n}",
q:"同一个烘焙石头模型，为什么放进一面实心墙后输出的顶点可能更少？",
choices:["资源管理器会替墙体重新烘焙一个石头模型。","上传阶段会根据玩家位置删除所有不可见顶点。","方块渲染阶段可按邻居剔除被完全遮挡的方向面。"],answer:2,
why:"BakedModel 仍提供同一组候选面；当前位置的邻接状态决定其中哪些方向面进入地形网格。"
},
{
name:"BufferBuilder",title:"汇集同一区段同一层的顶点",phase:"CPU · 批次数据",
lead:"每个方块只是往已有的地形层构建器追加几何。区段的该层编译结束时才封装这批数据。",
chain:["RebuildTask.compile","BufferBuilder.begin","VertexConsumer.putBulkData","BufferBuilder.end"],
detail:"一个区段会分别构建实际使用的 render layer。这里石头的数据写进 solid 批次，与该区段内其他 solid 方块共享 builder。begin 在启用某一层的批次时调用；该批次结束时调用 end。较新版本把结束后的数据包装为 RenderedBuffer 交给下一步。",
sources:[["每层批次 · compile",task],["begin / end",vertex+"BufferBuilder"]],
diff:["begin 接受整数绘制模式；end 结束当前批次，上传侧消费 builder 中的数据。","begin 的模式参数是 VertexFormat.Mode；end 仍结束 builder 内部批次。","begin 使用 VertexFormat.Mode；检查 end 与 popNextBuffer 的旧数据交接。","endOrDiscardIfEmpty 返回非空层的 RenderedBuffer；按层交给上传队列。","RenderedBuffer 在此仍是编译和上传之间的交接对象。","endOrDiscardIfEmpty 封装非空批次；RebuildTask.CompileResults 按层保存结果。"],
code:"// 1.19+ 批次形状，遍历结束后按层收尾\nbuilder.begin(VertexFormat.Mode.QUADS, DefaultVertexFormat.BLOCK);\n// 对属于本层的方块追加顶点。\nBufferBuilder.RenderedBuffer mesh = builder.endOrDiscardIfEmpty();",
q:"相邻两块石头都属于 solid，通常在什么粒度结束 BufferBuilder 批次？",
choices:["同一区段的 solid 层处理完时。","每块石头的每个面处理完时。","每次 renderChunkLayer 绘制到一个顶点时。"],answer:0,
why:"地形编译把同一区段中属于同一层的方块合并到同一批数据，按层结束。"
},
{
name:"VertexBuffer 上传",title:"把编译结果交给渲染线程上传",phase:"渲染线程 · GPU 上传",
lead:"CPU 网格已经生成。ChunkRenderDispatcher 负责将该层的数据交到对应区段的 VertexBuffer。",
chain:["RebuildTask.doTask","ChunkRenderDispatcher.uploadChunkLayer","ChunkRenderDispatcher.uploadAllPendingUploads","VertexBuffer.upload"],
detail:"异步路径提交上传工作，渲染侧抽取并执行待上传任务。VertexBuffer 为 GPU 持有顶点等绘制数据。新 compiled 状态与上传完成关联，后续地形绘制才能通过它知道哪些层有数据。单独看到编译结束只说明 CPU 已生成数据。",
sources:[["上传排队与排空 · uploadChunkLayer / uploadAllPendingUploads",dispatcher],["上传完成与 compiled 状态 · doTask",task],["上传 API · upload",vertex+"VertexBuffer"]],
diff:["旧上传入口接收 BufferBuilder；在 VertexBuffer 查看 upload 及其内部的线程处理。","旧上传入口仍以 BufferBuilder 为参数，查 VertexBuffer 如何取出批次。","uploadChunkLayer 接收 BufferBuilder，查看 VertexBuffer.upload 及索引数据路径。","uploadChunkLayer 和 VertexBuffer.upload 使用 BufferBuilder.RenderedBuffer。","保持 RenderedBuffer 上传；留意任务取消与释放由谁负责。","uploadChunkLayer 接收 RenderedBuffer；沿完成后的任务路径看 compiled 状态何时替换。"],
code:"// 以较新版本的异步分支为例，提交的是上传工作\nVertexBuffer vbo = renderChunk.getBuffer(layer);\nCompletableFuture<Void> uploaded = dispatcher.uploadChunkLayer(mesh, vbo);\n// 在上传真正完成后才执行依赖新网格的后续逻辑。",
q:"在后台重建线程看到 BufferBuilder.end 完成，接下来仍缺哪一步？",
choices:["缺一次资源重载，把石头模型从 JSON 烘焙出来。","缺渲染侧执行上传，将 CPU 数据交到 VertexBuffer。","缺一次服务端重新发送方块完整模型。"],answer:1,
why:"编译和上传各有边界。查看待上传队列及 future 完成点，才能确认 GPU 侧的新数据可用。"
},
{
name:"renderChunkLayer",title:"LevelRenderer 绘制 solid 地形层",phase:"渲染线程 · 绘制",
lead:"在世界渲染的地形绘制阶段，LevelRenderer 按层遍历可见区段，绘制这些区段已有的 GPU 缓冲。",
chain:["LevelRenderer.renderLevel","LevelRenderer.renderChunkLayer","RenderChunk.getCompiledChunk","RenderChunk.getBuffer","VertexBuffer.drawWithShader"],
detail:"沿石头走 solid pass。渲染器查看可见区段的 compiled 状态，跳过该层没有几何的区段，拿到对应 VertexBuffer，并把区段原点与相机位置结合，提交现有网格。相机移动、可见性和遮挡会影响区段是否进入绘制；普通情况下无需重新逐方块生成几何。",
sources:[["renderLevel / renderChunkLayer",renderer+"LevelRenderer"],["区段缓冲 · getBuffer",renderChunk],["层判定 · isEmpty",chunk+"ChunkRenderDispatcher$CompiledChunk"],["绘制 API",vertex+"VertexBuffer"]],
diff:["旧绘制接口使用 PoseStack 取得模型视图矩阵，由 VertexBuffer.draw 执行；检查旧 VertexFormat/渲染状态。","着色器地形路径可沿 VertexBuffer.drawWithShader 定位；LevelRenderer 仍按层处理。","从 renderChunkLayer 下断点，对比 PoseStack、相机参数和投影矩阵。","按层检查可见区段并取 VBO；跟踪 drawWithShader 与区段偏移。","矩阵类型迁移到 JOML；核对 renderChunkLayer 和 VertexBuffer 的本版签名。","drawWithShader 使用 JOML Matrix4f；从 renderChunkLayer 观察相机相对区段偏移和 solid pass。"],
code:"// 1.19.4 教学摘写，省略层状态与区段偏移 uniform\nif (!renderChunk.getCompiledChunk().isEmpty(layer)) {\n    VertexBuffer vbo = renderChunk.getBuffer(layer);\n    vbo.bind();\n    vbo.drawWithShader(modelView, projection, shader);\n}",
q:"石头所在区段没有变 dirty，下一帧仍能显示它吗？",
choices:["只有下一帧调用 renderBatched 才能显示。","只有再接收一次放置包才可以。","可以，若区段仍可见，就能复用已上传的缓冲进行绘制。"],answer:2,
why:"重建更新网格，绘制每帧消费现有网格。可见且该层有几何时就有可绘制的缓冲。"
}
];

const oldRegionVersions = ["1.16.5", "1.17.1"];
const oldMeshVersions = [...oldRegionVersions, "1.18.2"];
lessons[0].chain = [
  "Minecraft.startUseItem → MultiPlayerGameMode.useItemOn",
  "ItemStack.useOn → BlockItem.useOn → place → placeBlock", "Level.setBlock → LevelChunk.setBlockState",
  "ClientLevel.sendBlockUpdated", "LevelRenderer.blockChanged → setBlockDirty(BlockPos, boolean) → setSectionDirty",
  "ViewArea.setDirty → RenderChunk.setDirty"
];
lessons[0].lead = "跟踪玩家用石头物品放置一次普通方块。沿客户端应用放置结果的路径，找到被标记的 16×16×16 区段。";
lessons[0].detail = "在普通放置分支，MultiPlayerGameMode 经 ItemStack.useOn 调到 BlockItem；BlockItem.placeBlock 用 Level.setBlock 写入石头。客户端路径也经过 Level.setBlock（1.19.4 有 ClientLevel 覆写来记录预测）。在符合通知标志与状态条件时，Level.setBlock 动态分派到 ClientLevel.sendBlockUpdated。LevelRenderer.blockChanged 调用 setBlockDirty(BlockPos, boolean)，从方块周围 ±1 的坐标范围换算出区段；接收新旧 BlockState 的重载属于另一条通知路径。边界邻区段要重新决定贴着这块石头的面是否显示。";
lessons[0].sources.unshift(["放置 · placeBlock","net/minecraft/world/item/BlockItem"],["写入与通知 · setBlock","net/minecraft/world/level/Level"]);
lessons[0].code = "// BlockItem.placeBlock 的关键调用；3 = 更新邻居 + 通知客户端\nlevel.setBlock(pos, state, 3 | 8);\n// 状态变化触发渲染通知后，ViewArea 最终标记各个区段。\nviewArea.setDirty(sectionX, sectionY, sectionZ, urgent);";

lessons[1].chain = ["renderLevel → setupRender / compileChunks", "RenderChunk.rebuildChunkAsync",
  "RenderChunk.createCompileTask → new RebuildTask", "ChunkRenderDispatcher.schedule → runTask", "RebuildTask.doTask"];
lessons[1].chains = Object.fromEntries(oldRegionVersions.map(v => [v,
  ["renderLevel → setupRender / compileChunksUntil", ...lessons[1].chain.slice(1)]]));
lessons[1].diff[0] = "LevelRenderer.compileChunksUntil(long) 决定异步或同步重建。rebuildChunkAsync(dispatcher) 内部调用无参数的 createCompileTask()。";
lessons[1].diff[1] = "仍是 compileChunksUntil(long)；rebuildChunkAsync(dispatcher) 与 createCompileTask() 均不带区域缓存参数。";
lessons[1].diff[2] = "入口是 compileChunks(Camera)。异步入口为 rebuildChunkAsync(dispatcher, regionCache)，创建任务时传入 RenderRegionCache。";
lessons[1].examples = Object.fromEntries(oldRegionVersions.map(v => [v,
  "// 旧版 RenderChunk.rebuildChunkAsync 内的调度形状\nChunkCompileTask job = createCompileTask();\ndispatcher.schedule(job);"]));

lessons[2].chain = ["RenderChunk.createCompileTask", "RenderRegionCache.createRegion", "region 交给 RebuildTask",
  "RebuildTask.doTask → compile", "RenderChunkRegion.getBlockState"];
lessons[2].chains = Object.fromEntries(oldRegionVersions.map(v => [v,
  [lessons[2].chain[0], "RenderChunkRegion.createIfNotEmpty", ...lessons[2].chain.slice(2)]]));
lessons[2].versionSources = Object.fromEntries(oldRegionVersions.map(v => [v,
  lessons[2].sources.filter(([,path]) => !path.endsWith("RenderRegionCache"))
    .map(([label,path]) => [path.endsWith("RenderChunkRegion") ? "createIfNotEmpty / getBlockState" : label, path])]));
lessons[2].diff[0] = "RenderChunkRegion.createIfNotEmpty(Level, BlockPos, BlockPos, int) 静态工厂负责创建视图；可跟踪它保存的方块状态数组。";
lessons[2].diff[1] = "仍调用 RenderChunkRegion.createIfNotEmpty；还没有独立的 RenderRegionCache。";
lessons[2].diff[2] = "RenderRegionCache.createRegion 负责准备区域；RenderChunkRegion 通过渲染区块封装提供状态查询。";

lessons[3].chain = ["RebuildTask.compile", "ItemBlockRenderTypes.getChunkRenderType → 取该层 builder",
  "BlockRenderDispatcher.renderBatched", "getBlockModel → ModelBlockRenderer.tesselateBlock"];
lessons[3].diff[0] = "renderBatched 接收 java.util.Random，返回 boolean；编译循环可用返回值判断本次是否输出几何。";
lessons[3].diff[1] = "仍是 boolean renderBatched(..., Random)。关注 VertexConsumer 实际指向哪个 layer 的 builder。";
lessons[3].diff[2] = "仍是 boolean renderBatched(..., Random)；保留旧版的返回值类型来写 Mixin 描述符。";
lessons[3].diff[3] = "1.19 起 renderBatched 返回 void，随机参数改为 RandomSource。迁移 Mixin 时两个类型都要更新。";
lessons[3].diff[4] = "保持 void renderBatched(..., RandomSource)；输出对象的接口类型为 VertexConsumer。";

lessons[4].chain = ["BlockRenderDispatcher.getBlockModel → BlockModelShaper.getBlockModel",
  "BakedModel 交给 ModelBlockRenderer.tesselateBlock", "光照分支调用 BakedModel.getQuads"];
lessons[5].chain = ["ModelBlockRenderer.tesselateBlock", "tesselateWithAO / tesselateWithoutAO",
  "BakedModel.getQuads → 返回候选面", "renderModelFaceAO / renderModelFaceFlat → putQuadData", "VertexConsumer.putBulkData → 写入 BufferBuilder"];

lessons[6].chain = ["RebuildTask.compile → RenderChunk.beginLayer → BufferBuilder.begin",
  "renderBatched → 顶点写入", "RebuildTask.compile → BufferBuilder.endOrDiscardIfEmpty"];
lessons[6].chains = Object.fromEntries(oldMeshVersions.map(v => [v,
  [...lessons[6].chain.slice(0, 2), "RebuildTask.compile → BufferBuilder.end"]]));
lessons[6].examples = Object.fromEntries(oldMeshVersions.map(v => [v,
  "// 原版区段层初始化与结束的形状\nbuilder.begin(" +
  (v==="1.16.5" ? "GL11.GL_QUADS" : "VertexFormat.Mode.QUADS") +
  ", DefaultVertexFormat.BLOCK);\n// 追加本区段该层的顶点。\nbuilder.end();"]));

lessons[7].chain = ["RebuildTask.doTask → uploadChunkLayer", "待上传队列",
  "渲染侧 uploadAllPendingUploads → Runnable.run", "VertexBuffer.bind → upload → unbind"];
lessons[7].chains = Object.fromEntries(oldMeshVersions.map(v => [v,
  [...lessons[7].chain.slice(0,3), "doUploadChunkLayer → VertexBuffer.upload"]]));
lessons[7].examples = Object.fromEntries(oldMeshVersions.map(v => [v,
  "// 批次先在 CPU 侧 builder.end()，再提交上传。\nVertexBuffer vbo = renderChunk.getBuffer(layer);\nCompletableFuture<Void> uploaded = dispatcher.uploadChunkLayer(builder, vbo);"]));
lessons[7].detail += " 观察版别中的实际入口：旧版上传 continuation 进入 doUploadChunkLayer；新版上传 runnable 直接 bind、upload、unbind。";

lessons[8].chain = ["LevelRenderer.renderLevel", "LevelRenderer.renderChunkLayer",
  "CompiledChunk.isEmpty → RenderChunk.getBuffer", "VertexBuffer.bind → draw → unbind"];
lessons[8].chains = {
  "1.16.5":[...lessons[8].chain.slice(0,3),"VertexBuffer.bind → draw(Matrix4f, int) → unbind"],
  "1.17.1":[...lessons[8].chain.slice(0,3),"VertexBuffer.drawChunkLayer"],
  "1.18.2":[...lessons[8].chain.slice(0,3),"VertexBuffer.drawChunkLayer"]
};
lessons[8].detail += " 1.19.x 在层循环前应用 ShaderInstance，每个区段更新 ChunkOffset（若该 uniform 存在），然后调用 VertexBuffer.draw()。";
lessons[8].diff = [
  "renderChunkLayer 没有单独的投影矩阵参数；区段绘制调用 VertexBuffer.draw(Matrix4f, int)。",
  "renderChunkLayer 增加投影矩阵参数，并应用 ShaderInstance；该地形路径走 VertexBuffer.drawChunkLayer()。",
  "仍调用 drawChunkLayer()，投影参数类型为 com.mojang.math.Matrix4f。",
  "改为 VertexBuffer.bind() / draw() / unbind()，ShaderInstance 由 LevelRenderer 配置。",
  "renderChunkLayer 的投影参数改为 org.joml.Matrix4f。地形层仍直接调用 VertexBuffer.draw()。",
  "保持 JOML 投影矩阵，沿 renderChunkLayer → VertexBuffer.draw()；区段偏移由当前层的着色器 uniform 处理。"
];
lessons[8].code = "// 1.19.4：层的 shader 已经 apply；这里省略区段偏移 uniform\nif (!renderChunk.getCompiledChunk().isEmpty(layer)) {\n    VertexBuffer vbo = renderChunk.getBuffer(layer);\n    vbo.bind();\n    vbo.draw();\n}\nVertexBuffer.unbind();";
lessons[8].examples = {
  "1.16.5":"// modelView 已包含当前区段相对相机的平移\nVertexBuffer vbo = renderChunk.getBuffer(layer);\nvbo.bind();\nvbo.draw(modelView, GL11.GL_QUADS);\nVertexBuffer.unbind();",
  "1.17.1":"// 层着色器和区段偏移已设置\nif (!renderChunk.getCompiledChunk().isEmpty(layer)) {\n    renderChunk.getBuffer(layer).drawChunkLayer();\n}"
};
lessons[8].examples["1.18.2"] = lessons[8].examples["1.17.1"];

versions.splice(3, 0, "1.19");
for (const lesson of lessons) lesson.diff.splice(3, 0, lesson.diff[3]);
