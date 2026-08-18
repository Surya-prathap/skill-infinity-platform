package com.skillinfinity.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Utility class for pagination calculations.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class PaginationUtil {

    public static int calculateOffset(int page, int size) {
        return (page - 1) * size;
    }

    public static int calculateTotalPages(long totalElements, int size) {
        if (size <= 0) return 0;
        return (int) Math.ceil((double) totalElements / size);
    }

    public static boolean hasNext(int page, int totalPages) {
        return page < totalPages;
    }

    public static boolean hasPrevious(int page) {
        return page > 1;
    }

    public static int normalizePage(int page) {
        return Math.max(1, page);
    }

    public static int normalizeSize(int size, int defaultSize, int maxSize) {
        if (size <= 0) return defaultSize;
        return Math.min(size, maxSize);
    }
}
