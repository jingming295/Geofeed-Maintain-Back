import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, AutoIncrement } from '@sequelize/core/decorators-legacy';

export class Country extends Model<InferAttributes<Country>, InferCreationAttributes<Country>>
{
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @NotNull
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare alpha_2_code: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare alpha_3_code: string;


    @Attribute(DataTypes.STRING)
    @NotNull
    declare iso_numeric: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare name: string;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare is_deleted: boolean;

}