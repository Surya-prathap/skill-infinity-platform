package com.skillinfinity.common.mapper;

/**
 * Base mapper interface for MapStruct integration.
 * <p>
 * All microservice mappers should extend this interface
 * to inherit common mapping methods.
 *
 * @param <E> the entity type
 * @param <D> the DTO type
 */
public interface BaseMapper<E, D> {

    D toDto(E entity);

    E toEntity(D dto);
}
