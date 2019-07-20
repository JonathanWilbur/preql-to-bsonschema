import { APIObject, Logger, StructSpec, AttributeSpec, APIObjectDatabase, ForeignKeySpec } from 'preql-core';
import transpileAttribute from './attribute';

const transpileStruct = async (obj: APIObject<StructSpec>, logger: Logger, etcd: APIObjectDatabase): Promise<object> => {
    const ret: any = {
        title: obj.spec.name,
        additionalProperties: false,
        required: [],
        properties: {},
    };

    await Promise.all(
        (etcd.kindIndex.attribute || [])
            .filter((attr: APIObject<AttributeSpec>): boolean => (
                attr.spec.structName === obj.spec.name
                && attr.spec.databaseName === obj.spec.databaseName
            ))
            .map(async (attr: APIObject<AttributeSpec>): Promise<void> => {
                ret.properties[attr.spec.name] = await transpileAttribute(attr, logger, etcd);
                if (attr.spec.nullable === false) {
                    ret.required.push(attr.spec.name);
                }
            })
    );

    /**
     * The reason you use the FKs instead of just filtering all structs within
     * the database is that you cannot be sure that all structs directly link
     * to the current struct. For example, B might have an FK on A, and C an
     * FK on B, but C might not have an FK on A.
     */
    await Promise.all(
        (etcd.kindIndex.foreignkey || []) // Get foreign keys
            // ...in which this is the parent (so we can get children)
            .filter((fk: APIObject<ForeignKeySpec>): boolean => (
                fk.spec.databaseName === obj.spec.databaseName
                && fk.spec.parentStructName === obj.spec.name
            ))
            // Then, get the associated child structs.
            .map((fk: APIObject<ForeignKeySpec>): [APIObject<StructSpec>, APIObject<ForeignKeySpec>] => {
                const struct = etcd.kindIndex.struct.find((struct: APIObject<StructSpec>): boolean => (
                    struct.spec.databaseName === obj.spec.databaseName
                    && struct.spec.name === fk.spec.childStructName
                ));
                if (!struct) {
                    throw new Error(`Struct '${fk.spec.childStructName}' not found.`);
                }
                return [struct, fk];
            })
            // Then add the fields for each child struct.
            .map(async (structAndFK: [APIObject<StructSpec>, APIObject<ForeignKeySpec>]): Promise<void> => {
                if (structAndFK[0].spec.entityName === obj.spec.entityName) {
                    ret.properties[structAndFK[0].spec.name] = {
                        type: 'array',
                        items: await transpileStruct(structAndFK[0], logger, etcd),
                    };
                } else {
                    ret.properties[structAndFK[0].spec.name] = {
                        type: 'array',
                        items: {
                            type: 'objectId',
                        },
                    };
                }
            })
    );

    /**
     * The reason you use the FKs instead of just filtering all structs within
     * the database is that you cannot be sure that all structs directly link
     * to the current struct. For example, B might have an FK on A, and C an
     * FK on B, but C might not have an FK on A.
     */
    await Promise.all(
        (etcd.kindIndex.foreignkey || []) // Get foreign keys
            // ...in which this is the child (so we can get parents)
            .filter((fk: APIObject<ForeignKeySpec>): boolean => (
                fk.spec.databaseName === obj.spec.databaseName
                && fk.spec.childStructName === obj.spec.name // REVIEW
            ))
            // Then, get the associated parent structs.
            .map((fk: APIObject<ForeignKeySpec>): [APIObject<StructSpec>, APIObject<ForeignKeySpec>] => {
                const struct = etcd.kindIndex.struct.find((struct: APIObject<StructSpec>): boolean => (
                    struct.spec.databaseName === obj.spec.databaseName
                    && struct.spec.name === fk.spec.parentStructName
                ));
                if (!struct) {
                    throw new Error(`Struct '${fk.spec.parentStructName}' not found.`);
                }
                return [struct, fk];
            })
            // Then add the fields for each parent struct.
            .map(async (structAndFK: [APIObject<StructSpec>, APIObject<ForeignKeySpec>]): Promise<void> => {
                /**
                 * Nothing needs to be done if the parent struct and the child
                 * struct are within the same entity, because, by virtue of the
                 * recursion used in this library, the child struct will already
                 * be added to the parent struct in the entity if they are in the
                 * same entity.
                 */
                if (structAndFK[0].spec.entityName !== obj.spec.entityName) {
                    ret.properties[structAndFK[0].spec.name] = {
                        type: 'objectId',
                    };
                }
                if (structAndFK[1].spec.nullable === false) {
                    ret.required.push(structAndFK[0].spec.name);
                }
            })
    );

    return ret;
};

export default transpileStruct;
