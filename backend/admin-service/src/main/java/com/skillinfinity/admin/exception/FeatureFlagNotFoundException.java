package com.skillinfinity.admin.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class FeatureFlagNotFoundException extends ResourceNotFoundException {

    public FeatureFlagNotFoundException(String identifier) {
        super("FeatureFlag", identifier);
    }
}
