import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, Default, AutoIncrement, AllowNull, BelongsTo } from '@sequelize/core/decorators-legacy';
import { User_Roles } from './User_Roles.js';

export class Users extends Model<InferAttributes<Users>, InferCreationAttributes<Users>>
{
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @NotNull
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare email: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare password: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Default('default.png')
    declare avatar: CreationOptional<string>;

    @Attribute(DataTypes.STRING)
    @AllowNull
    declare token: string | null;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare user_role_id: number;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare is_active: boolean;

    @BelongsTo(() => User_Roles, 'user_role_id')
    declare user_role?: NonAttribute<User_Roles>;

}

