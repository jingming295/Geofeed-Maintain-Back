import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, AutoIncrement, BelongsTo } from '@sequelize/core/decorators-legacy';
import { Users } from '../users/Users';





export class ASN extends Model<InferAttributes<ASN>, InferCreationAttributes<ASN>>
{
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @NotNull
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare as_number: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare as_name: string;


    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare user_id: number;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare is_active: boolean;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare is_deleted: boolean;

    @BelongsTo(() => Users, 'user_id')
    declare users?: NonAttribute<Users>;

}