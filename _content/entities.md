---
title: Entity structure
summary: |
    OpenSanctions uses the FollowTheMoney data model to structure its entity graph. Below
    is an explanation of how entities and their relationships are designed.
---


[FollowTheMoney (FtM)](https://followthemoney.tech) defines a simple data model for storing complex object graphs. You will need to understand three concepts: *entities*,
*entity references*, and *entity streams*.

## Entities

Entities are often expressed as snippets of JSON, with three standard fields: a unique ``id``, a specification of the type of the entity called ``schema``, and a set of ``properties``. All properties are multi-valued and values are always strings.

```json
{
    "id": "1b38214f88d139897bbd13eabde464043d84bbf9",
    "schema": "Person",
    "properties": {
        "name": ["John Doe"],
        "nationality": ["us", "au"],
        "birthDate": ["1982"]
    }
}
```

What properties can be set for an entity is determined by it's schema. For example, a  [Person](/reference/#schema.Person) has a `nationality`, while a [Company](/reference/#schema,Company) allows for setting a `jurisdiction`. Both properties, however, have the same *property type*, [country](/reference/#type.country). You can see a full listing of the available schemata and their properties in the [data dictionary](/reference/).


## References

Entities can reference other entities. This is achieved via a special property type, `entity`. Properties of this type simply store the [ID](/docs/identifiers/) of another entity. For example, a [Passport](/reference/#schema.Passport) entity can be linked to a [Person](/reference/#schema.Person) entity via its `holder` property:

```json
{
    "id": "passport-entity-id",
    "schema": "Passport",
    "properties": {
        "holder": ["person-entity-id"],
        "number": ["CJ 7261817"]
    }
}
```

### Interstitial entities

A link between two entities will have its own attributes. For example, an investigator looking at a person that owns a company might want to know when that interest was acquired, and also what percentage of shares the person holds.

This is addressed by making interstitial entities. In the example above, an [Ownership](/reference/#schema.Ownership) entity would be created, with references to the person as its `owner` property and to the company as its `asset` property. That entity can then define further properties, including `startDate` and `percentage`:

```json
{
    "id": "ownership-entity-id",
    "schema": "Ownership",
    "properties": {
        "owner": ["person-entity-id"],
        "asset": ["company-entity-id"],
        "startDate": ["2020-01-01"],
        "percentage": ["51%"],
    }
}
```

*Note: It is tempting to simplify this model by assuming that entities derived from [Thing](/reference/#schema.Thing) are node entities, and those derived from [Interval](/reference/#schema.Ownership) are edges. This assumption is false and will lead to nasty bugs in your code.*

## Streams

Many tools in the FtM ecosystem use streams of entities to transfer or store information. Entity streams are simply sequences of entity objects that have been serialised to JSON as single lines without any indentation, each entity separated by a newline.

Entity streams are read and produced by virtually every part of the [FollowTheMoney command-line](https://followthemoney.tech/docs/cli/), OpenSanctions, and the Aleph platform. When stored to disk as a file, the extensions `.ftm` or `.ijson` should be used.


## Tools for working with FtM data

Some further documentation regarding FtM tooling:

* [Converting FtM entities to a Neo4J property graph](https://docs.alephdata.org/developers/followthemoney/ftm#exporting-data-to-a-network-graph)
* [Converting an FtM file to a Gephi file (GEXF)](https://docs.alephdata.org/developers/followthemoney/ftm#gexf-for-gephi-sigma-js)
* [Converting to RDF/Linked Data](https://docs.alephdata.org/developers/followthemoney/ftm#exporting-entities-to-rdf-linked-data)
* [Command-line Aleph import](https://docs.alephdata.org/developers/alephclient#writing-a-stream-of-entities-to-a-collection) (you can also import the *FollowTheMoney entities* (``entities.ftm.json``) data into Aleph by
uploading the file to an investigation)