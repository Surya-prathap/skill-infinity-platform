package com.skillinfinity.common.dto.request;

import java.io.Serializable;

/**
 * Base class for all request DTOs.
 * <p>
 * All request DTOs across microservices should extend this class
 * to ensure consistent serialization and validation behavior.
 */
public abstract class BaseRequest implements Serializable {
}
