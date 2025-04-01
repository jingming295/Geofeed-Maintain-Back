import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, Default, AutoIncrement } from '@sequelize/core/decorators-legacy';

export class User_Roles extends Model<InferAttributes<User_Roles>, InferCreationAttributes<User_Roles>>
{
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @NotNull
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare role_name: string;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    @Default(true)
    declare is_active: CreationOptional<boolean>;
}

