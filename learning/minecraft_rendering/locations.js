const locations = {
  "1.16.5": [
    {
      "net/minecraft/world/item/BlockItem": "placeBlock L151",
      "net/minecraft/world/level/Level": "setBlock L217 / setBlock L221–275",
      "net/minecraft/client/multiplayer/ClientLevel": "sendBlockUpdated L556–557",
      "net/minecraft/client/renderer/LevelRenderer": "blockChanged L2453–2454",
      "net/minecraft/client/renderer/ViewArea": "setDirty L86–92",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "setDirty L325–328"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "compileChunksUntil L2176–2205",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L372–378",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "schedule L190–195",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L413–445"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L372–378",
      "net/minecraft/client/renderer/chunk/RenderChunkRegion": "createIfNotEmpty L31–51 / getBlockState L103",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L459–533"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L459–533",
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "renderBatched L57–68",
      "net/minecraft/client/renderer/ItemBlockRenderTypes": "getChunkRenderType L278–286"
    },
    {
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "getBlockModel L90",
      "net/minecraft/client/renderer/block/BlockModelShaper": "getBlockModel L29–34",
      "net/minecraft/client/resources/model/BakedModel": "getQuads"
    },
    {
      "net/minecraft/client/renderer/block/ModelBlockRenderer": "tesselateBlock L42–57 / putQuadData L140–152",
      "com/mojang/blaze3d/vertex/VertexConsumer": "putBulkData L63–64 / putBulkData L70–119"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L459–533",
      "com/mojang/blaze3d/vertex/BufferBuilder": "begin L214–225 / end L242–253"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "uploadAllPendingUploads L169–177 / uploadChunkLayer L198",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L413–445",
      "com/mojang/blaze3d/vertex/VertexBuffer": "upload L26–33"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "renderChunkLayer L1463–1536",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "getBuffer L276",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$CompiledChunk": "isEmpty L661",
      "com/mojang/blaze3d/vertex/VertexBuffer": "draw L57–62"
    }
  ],
  "1.17.1": [
    {
      "net/minecraft/world/item/BlockItem": "placeBlock L158",
      "net/minecraft/world/level/Level": "setBlock L196 / setBlock L201–255",
      "net/minecraft/client/multiplayer/ClientLevel": "sendBlockUpdated L477–478",
      "net/minecraft/client/renderer/LevelRenderer": "blockChanged L2529–2530",
      "net/minecraft/client/renderer/ViewArea": "setDirty L87–93",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "setDirty L338–341"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "compileChunksUntil L2243–2272",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L385–391",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "schedule L198–203",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L426–458"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L385–391",
      "net/minecraft/client/renderer/chunk/RenderChunkRegion": "createIfNotEmpty L31–51 / getBlockState L101",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L472–545"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L472–545",
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "renderBatched L59–70",
      "net/minecraft/client/renderer/ItemBlockRenderTypes": "getChunkRenderType L301–309"
    },
    {
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "getBlockModel L92",
      "net/minecraft/client/renderer/block/BlockModelShaper": "getBlockModel L29–34",
      "net/minecraft/client/resources/model/BakedModel": "getQuads"
    },
    {
      "net/minecraft/client/renderer/block/ModelBlockRenderer": "tesselateBlock L43–58 / putQuadData L145–157",
      "com/mojang/blaze3d/vertex/VertexConsumer": "putBulkData L63–64 / putBulkData L70–121"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L472–545",
      "com/mojang/blaze3d/vertex/BufferBuilder": "begin L130–141 / end L225–261"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "uploadAllPendingUploads L177–185 / uploadChunkLayer L206",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L426–458",
      "com/mojang/blaze3d/vertex/VertexBuffer": "upload L45–52"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "renderChunkLayer L1486–1608",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "getBuffer L289",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$CompiledChunk": "isEmpty L672",
      "com/mojang/blaze3d/vertex/VertexBuffer": "draw L109–113 / drawChunkLayer L191–201"
    }
  ],
  "1.18.2": [
    {
      "net/minecraft/world/item/BlockItem": "placeBlock L159",
      "net/minecraft/world/level/Level": "setBlock L196 / setBlock L201–255",
      "net/minecraft/client/multiplayer/ClientLevel": "sendBlockUpdated L509–510",
      "net/minecraft/client/renderer/LevelRenderer": "blockChanged L2636–2637",
      "net/minecraft/client/renderer/ViewArea": "setDirty L92–98",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "setDirty L359–362"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "compileChunks L2341–2379",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L409–418",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "schedule L216–225",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L462–494"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L409–418",
      "net/minecraft/client/renderer/chunk/RenderChunkRegion": "getBlockState L32–35",
      "net/minecraft/client/renderer/chunk/RenderRegionCache": "createRegion L39–64",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L511–585"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L511–585",
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "renderBatched L59–70",
      "net/minecraft/client/renderer/ItemBlockRenderTypes": "getChunkRenderType L301–309"
    },
    {
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "getBlockModel L92",
      "net/minecraft/client/renderer/block/BlockModelShaper": "getBlockModel L29–34",
      "net/minecraft/client/resources/model/BakedModel": "getQuads"
    },
    {
      "net/minecraft/client/renderer/block/ModelBlockRenderer": "tesselateBlock L43–58 / putQuadData L145–157",
      "com/mojang/blaze3d/vertex/VertexConsumer": "putBulkData L64–65 / putBulkData L71–122"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L511–585",
      "com/mojang/blaze3d/vertex/BufferBuilder": "begin L130–141 / end L225–261"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "uploadAllPendingUploads L201–204 / uploadChunkLayer L228",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L462–494",
      "com/mojang/blaze3d/vertex/VertexBuffer": "upload L45–52"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "renderChunkLayer L1567–1692",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "getBuffer L314",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$CompiledChunk": "isEmpty L722",
      "com/mojang/blaze3d/vertex/VertexBuffer": "draw L109–113 / drawChunkLayer L197–207"
    }
  ],
  "1.19": [
    {
      "net/minecraft/world/item/BlockItem": "placeBlock L159",
      "net/minecraft/world/level/Level": "setBlock L206 / setBlock L211–265",
      "net/minecraft/client/multiplayer/ClientLevel": "sendBlockUpdated L559–560",
      "net/minecraft/client/renderer/LevelRenderer": "blockChanged L2648–2649",
      "net/minecraft/client/renderer/ViewArea": "setDirty L92–98",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "setDirty L365–368"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "compileChunks L2354–2392",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L415–424",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "schedule L219–228",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L468–508"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L415–424",
      "net/minecraft/client/renderer/chunk/RenderChunkRegion": "getBlockState L32–35",
      "net/minecraft/client/renderer/chunk/RenderRegionCache": "createRegion L39–64",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L524–602"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L524–602",
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "renderBatched L59–71",
      "net/minecraft/client/renderer/ItemBlockRenderTypes": "getChunkRenderType L311–319"
    },
    {
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "getBlockModel L91",
      "net/minecraft/client/renderer/block/BlockModelShaper": "getBlockModel L29–34",
      "net/minecraft/client/resources/model/BakedModel": "getQuads"
    },
    {
      "net/minecraft/client/renderer/block/ModelBlockRenderer": "tesselateBlock L43–60 / putQuadData L133–145",
      "com/mojang/blaze3d/vertex/VertexConsumer": "putBulkData L64–65 / putBulkData L71–122"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L524–602",
      "com/mojang/blaze3d/vertex/BufferBuilder": "begin L125–136 / end L235–238"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "uploadAllPendingUploads L204–207 / uploadChunkLayer L231–238",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L468–508",
      "com/mojang/blaze3d/vertex/VertexBuffer": "upload L36–54"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "renderChunkLayer L1571–1687",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "getBuffer L320",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$CompiledChunk": "isEmpty L746",
      "com/mojang/blaze3d/vertex/VertexBuffer": "draw L107–108"
    }
  ],
  "1.19.2": [
    {
      "net/minecraft/world/item/BlockItem": "placeBlock L159",
      "net/minecraft/world/level/Level": "setBlock L206 / setBlock L211–265",
      "net/minecraft/client/multiplayer/ClientLevel": "sendBlockUpdated L559–560",
      "net/minecraft/client/renderer/LevelRenderer": "blockChanged L2649–2650",
      "net/minecraft/client/renderer/ViewArea": "setDirty L92–98",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "setDirty L366–369"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "compileChunks L2355–2393",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L416–425",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "schedule L220–229",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L469–509"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L416–425",
      "net/minecraft/client/renderer/chunk/RenderChunkRegion": "getBlockState L32–35",
      "net/minecraft/client/renderer/chunk/RenderRegionCache": "createRegion L39–64",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L525–603"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L525–603",
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "renderBatched L59–71",
      "net/minecraft/client/renderer/ItemBlockRenderTypes": "getChunkRenderType L311–319"
    },
    {
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "getBlockModel L91",
      "net/minecraft/client/renderer/block/BlockModelShaper": "getBlockModel L29–34",
      "net/minecraft/client/resources/model/BakedModel": "getQuads"
    },
    {
      "net/minecraft/client/renderer/block/ModelBlockRenderer": "tesselateBlock L43–60 / putQuadData L133–145",
      "com/mojang/blaze3d/vertex/VertexConsumer": "putBulkData L64–65 / putBulkData L71–122"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L525–603",
      "com/mojang/blaze3d/vertex/BufferBuilder": "begin L125–136 / end L235–238"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "uploadAllPendingUploads L205–208 / uploadChunkLayer L232–239",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L469–509",
      "com/mojang/blaze3d/vertex/VertexBuffer": "upload L36–54"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "renderChunkLayer L1572–1688",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "getBuffer L321",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$CompiledChunk": "isEmpty L747",
      "com/mojang/blaze3d/vertex/VertexBuffer": "draw L107–108"
    }
  ],
  "1.19.3": [
    {
      "net/minecraft/world/item/BlockItem": "placeBlock L163",
      "net/minecraft/world/level/Level": "setBlock L209 / setBlock L214–268",
      "net/minecraft/client/multiplayer/ClientLevel": "sendBlockUpdated L561–562",
      "net/minecraft/client/renderer/LevelRenderer": "blockChanged L2651–2652",
      "net/minecraft/client/renderer/ViewArea": "setDirty L92–98",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "setDirty L366–369"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "compileChunks L2356–2394",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L416–425",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "schedule L220–229",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L469–509"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L416–425",
      "net/minecraft/client/renderer/chunk/RenderChunkRegion": "getBlockState L32–35",
      "net/minecraft/client/renderer/chunk/RenderRegionCache": "createRegion L39–64",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L525–603"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L525–603",
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "renderBatched L58–70",
      "net/minecraft/client/renderer/ItemBlockRenderTypes": "getChunkRenderType L313–321"
    },
    {
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "getBlockModel L90",
      "net/minecraft/client/renderer/block/BlockModelShaper": "getBlockModel L27–32",
      "net/minecraft/client/resources/model/BakedModel": "getQuads"
    },
    {
      "net/minecraft/client/renderer/block/ModelBlockRenderer": "tesselateBlock L43–60 / putQuadData L133–145",
      "com/mojang/blaze3d/vertex/VertexConsumer": "putBulkData L64–65 / putBulkData L71–119"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L525–603",
      "com/mojang/blaze3d/vertex/BufferBuilder": "begin L125–136 / end L235–238"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "uploadAllPendingUploads L205–208 / uploadChunkLayer L232–239",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L469–509",
      "com/mojang/blaze3d/vertex/VertexBuffer": "upload L36–54"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "renderChunkLayer L1573–1689",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "getBuffer L321",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$CompiledChunk": "isEmpty L747",
      "com/mojang/blaze3d/vertex/VertexBuffer": "draw L107–108"
    }
  ],
  "1.19.4": [
    {
      "net/minecraft/world/item/BlockItem": "placeBlock L163",
      "net/minecraft/world/level/Level": "setBlock L215 / setBlock L220–274",
      "net/minecraft/client/multiplayer/ClientLevel": "sendBlockUpdated L556–557",
      "net/minecraft/client/renderer/LevelRenderer": "blockChanged L2607–2608",
      "net/minecraft/client/renderer/ViewArea": "setDirty L92–98",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "setDirty L366–369"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "compileChunks L2304–2342",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L416–425",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "schedule L220–229",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L469–509"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "createCompileTask L416–425",
      "net/minecraft/client/renderer/chunk/RenderChunkRegion": "getBlockState L32–35",
      "net/minecraft/client/renderer/chunk/RenderRegionCache": "createRegion L39–64",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L525–603"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L525–603",
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "renderBatched L58–70",
      "net/minecraft/client/renderer/ItemBlockRenderTypes": "getChunkRenderType L322–330"
    },
    {
      "net/minecraft/client/renderer/block/BlockRenderDispatcher": "getBlockModel L90",
      "net/minecraft/client/renderer/block/BlockModelShaper": "getBlockModel L27–32",
      "net/minecraft/client/resources/model/BakedModel": "getQuads"
    },
    {
      "net/minecraft/client/renderer/block/ModelBlockRenderer": "tesselateBlock L43–60 / putQuadData L133–145",
      "com/mojang/blaze3d/vertex/VertexConsumer": "putBulkData L64–65 / putBulkData L71–119"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "compile L525–603",
      "com/mojang/blaze3d/vertex/BufferBuilder": "begin L125–136 / end L235–238"
    },
    {
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher": "uploadAllPendingUploads L205–208 / uploadChunkLayer L232–239",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk$RebuildTask": "doTask L469–509",
      "com/mojang/blaze3d/vertex/VertexBuffer": "upload L36–54"
    },
    {
      "net/minecraft/client/renderer/LevelRenderer": "renderChunkLayer L1576–1703",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$RenderChunk": "getBuffer L321",
      "net/minecraft/client/renderer/chunk/ChunkRenderDispatcher$CompiledChunk": "isEmpty L747",
      "com/mojang/blaze3d/vertex/VertexBuffer": "draw L107–108"
    }
  ]
};
