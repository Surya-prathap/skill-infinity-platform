package com.skillinfinity.session.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityAllowanceResponse {

    /** Monthly limit (spec default: 3 free community sessions per calendar month). */
    private int limit;

    /** Completed community sessions this calendar month. */
    private int used;

    private int remaining;

    private String month;
}
