package com.skillinfinity.admin.exception;

import com.skillinfinity.common.exception.ResourceNotFoundException;

public class PlatformSettingNotFoundException extends ResourceNotFoundException {

    public PlatformSettingNotFoundException(String key) {
        super("PlatformSetting", key);
    }
}
