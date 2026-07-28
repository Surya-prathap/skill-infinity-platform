package com.skillinfinity.community.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Tag with post count")
public class TagCountResponse {

    @Schema(description = "Tag name")
    private String tag;

    @Schema(description = "Post count")
    private long count;
}
