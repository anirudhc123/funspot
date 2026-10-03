-- CreateIndex
CREATE INDEX "Post_visibility_createdAt_id_idx" ON "Post"("visibility", "createdAt", "id");

-- CreateIndex
CREATE INDEX "PostHashtag_hashtagId_postId_idx" ON "PostHashtag"("hashtagId", "postId");
