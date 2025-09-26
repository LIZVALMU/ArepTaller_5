package com.arep.property.service.impl;

import com.arep.property.model.Property;
import com.arep.property.repository.PropertyRepository;
import com.arep.property.service.PropertyService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository repository;

    public PropertyServiceImpl(PropertyRepository repository) {
        this.repository = repository;
    }

    @Override
    public Property create(Property property) {
        property.setId(null);
        return repository.save(property);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Property> findAll(String address, Double minPrice, Double maxPrice, Double minSize, Double maxSize, Pageable pageable) {
        Specification<Property> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (address != null && !address.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("address")), "%" + address.toLowerCase() + "%"));
            }
            if (minPrice != null) predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            if (maxPrice != null) predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            if (minSize != null) predicates.add(cb.greaterThanOrEqualTo(root.get("size"), minSize));
            if (maxSize != null) predicates.add(cb.lessThanOrEqualTo(root.get("size"), maxSize));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return repository.findAll(spec, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Property> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Property update(Long id, Property property) {
        Property existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Property not found"));
        existing.setAddress(property.getAddress());
        existing.setPrice(property.getPrice());
        existing.setSize(property.getSize());
        existing.setDescription(property.getDescription());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Property not found");
        }
        repository.deleteById(id);
    }
}
