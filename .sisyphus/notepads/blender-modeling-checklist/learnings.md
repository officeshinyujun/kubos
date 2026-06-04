+ Added `utils/meshOperations/deleteSelection.ts` as a pure topology-rebuild operation.
+ Deletion now clears all selection flags, filters orphaned vertices, and rebuilds edges from the remaining faces so the mesh stays consistent after face/edge/vertex deletion.
