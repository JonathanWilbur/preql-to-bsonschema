import { APIObject, APIObjectDatabase, Logger } from 'preql-core';
import transpileEntity from '../Transpilers/entity';

const transpile = async (etcd: APIObjectDatabase, logger: Logger): Promise<object> => {
    let transpilations: object[] = [];

    // Get rootStruct from entity
    // Starting with the rootStruct,
    // - transpile Attributes
    // - transpile ForeignKeys as ObjectID
    // - For every Struct in the Entity, if it has a foreignKey that points to another struct, attach it.

    const entities: APIObject[] | undefined = etcd.kindIndex.entity;
    if (entities && entities.length > 0) {
        transpilations = transpilations.concat(await Promise.all(entities.map(
            async (obj: APIObject): Promise<object> => {
                return transpileEntity(obj, logger, etcd);
            }
        )));
    }

    return {
        jsonSchema: transpilations,
    };
};

export default transpile;
