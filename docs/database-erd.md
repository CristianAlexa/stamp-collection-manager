
# Stamp Collection Manager — Database ERD

## Overview

This document describes the relational database architecture
implemented during Week 6 of the development roadmap.

The database contains 26 models organised into shared catalogue
information, reusable attributes, dynamic variations, historical
valuations and personal collections.

## 1. Shared Catalogue and Philatelic Attributes

```mermaid
erDiagram
    Country ||--o{ Stamp : issues
    Country ||--o{ StampSeries : groups
    Currency o|--o{ Stamp : denomination
    Catalogue ||--o{ CatalogueReference : defines
    Stamp ||--o{ CatalogueReference : identified_by
    StampType o|--o{ Stamp : classifies
    StampSeries o|--o{ Stamp : groups
    Stamp ||--o{ StampColour : has
    Colour ||--o{ StampColour : defines
    Stamp ||--o{ StampTheme : has
    Theme ||--o{ StampTheme : defines
    Watermark o|--o{ Stamp : identifies
    Country ||--o{ WatermarkCountry : associates
    Watermark ||--o{ WatermarkCountry : belongs_to
    Perforation o|--o{ Stamp : describes
    Stamp ||--o{ StampVariant : has
    StampVariant ||--o{ VariantColour : has
    Colour ||--o{ VariantColour : defines
    Watermark o|--o{ StampVariant : overrides
    Perforation o|--o{ StampVariant : overrides
    StampVariant ||--o{ VariantAttribute : has
    VariationValue ||--o{ VariantAttribute : defines
    VariationType ||--o{ VariationValue : contains
```

## 2. Catalogue Valuations and Personal Ownership

```mermaid
erDiagram
    Catalogue ||--o{ CatalogueEdition : publishes
    Catalogue ||--o{ CatalogueReference : defines
    CatalogueReference ||--o{ CatalogueValuation : has
    CatalogueEdition ||--o{ CatalogueValuation : publishes
    StampVariant o|--o{ CatalogueValuation : specifies
    Currency ||--o{ CatalogueValuation : values
    User ||--o{ Album : owns
    User ||--o{ CollectionItem : owns
    Album o|--o{ CollectionItem : contains
    Stamp ||--o{ CollectionItem : identifies
    Stamp ||--o{ StampVariant : has
    StampVariant o|--o{ CollectionItem : specifies
    CollectionItem ||--o{ CollectionImage : photographs
    Stamp ||--o{ CatalogueImage : illustrates
    StampVariant o|--o{ CatalogueImage : specifies
    Currency o|--o{ CollectionItem : purchase_currency
    Currency o|--o{ CollectionItem : market_currency
```

## 3. Relationship Notation

- `||` — Exactly one.
- `o|` — Zero or one.
- `o{` — Zero or many.
- `|{` — One or many.

## 4. Source of Truth

These diagrams represent the logical database relationships.

The authoritative database definition is located in:

`prisma/schema.prisma`

Custom database constraints are maintained in:

`prisma/migrations/`

## 5. Architecture Version

- Project: Stamp Collection Manager v3.0
- Sprint: Week 06
- Database: PostgreSQL 16
- ORM: Prisma 7
- Models: 26
- Enums: 6
