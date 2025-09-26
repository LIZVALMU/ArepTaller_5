package com.arep.property.service;

import com.arep.property.model.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface PropertyService {
    Property create(Property property);
    Page<Property> findAll(String address, Double minPrice, Double maxPrice, Double minSize, Double maxSize, Pageable pageable);
    Optional<Property> findById(Long id);
    Property update(Long id, Property property);
    void delete(Long id);
}
