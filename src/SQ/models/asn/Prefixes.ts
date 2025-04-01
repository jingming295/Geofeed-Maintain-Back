import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, AutoIncrement, BelongsTo } from '@sequelize/core/decorators-legacy';
import { ASN } from './ASN';





export class Prefixes extends Model<InferAttributes<Prefixes>, InferCreationAttributes<Prefixes>>
{
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @NotNull
    @AutoIncrement
    declare id: CreationOptional<number>;


    @Attribute(DataTypes.STRING)
    @NotNull
    declare prefix_name: string;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare asn_id: number;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare is_present: boolean;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare is_active: boolean;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare is_deleted: boolean;

    @BelongsTo(() => ASN, 'asn_id')
    declare asn?: NonAttribute<ASN>;

}