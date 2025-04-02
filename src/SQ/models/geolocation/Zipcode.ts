import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, AutoIncrement, AllowNull, BelongsTo } from '@sequelize/core/decorators-legacy';
import { City } from './City';

export class Zipcode extends Model<InferAttributes<Zipcode>, InferCreationAttributes<Zipcode>>
{
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @NotNull
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @AllowNull
    declare name: string | null;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare city_id: number;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare is_deleted: boolean;

    @BelongsTo(() => City, 'city_id')
    declare city?: NonAttribute<City>;
}