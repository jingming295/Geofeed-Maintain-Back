import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, AutoIncrement, AllowNull, BelongsTo } from '@sequelize/core/decorators-legacy';
import { Subdivision } from './Subdivision';

export class City extends Model<InferAttributes<City>, InferCreationAttributes<City>>
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
    declare subdivision_id: number;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare is_deleted: boolean;

    @BelongsTo(() => Subdivision, 'subdivision_id')
    declare subdivision?: NonAttribute<Subdivision>;
}