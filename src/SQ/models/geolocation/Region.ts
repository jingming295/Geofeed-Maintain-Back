import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, AutoIncrement, AllowNull, BelongsTo } from '@sequelize/core/decorators-legacy';
import { Country } from './Country';

export class Region extends Model<InferAttributes<Region>, InferCreationAttributes<Region>>
{
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @NotNull
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare code_3166_2: string;

    @Attribute(DataTypes.STRING)
    @AllowNull
    declare name: string | null;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare country_id: number;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare is_deleted: boolean;

    @BelongsTo(() => Country, 'country_id')
    declare country?: NonAttribute<Country>;
}