import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull, AutoIncrement, BelongsTo, AllowNull } from '@sequelize/core/decorators-legacy';
import { ASN } from './ASN';
import { City } from '../geolocation/City';
import { Country } from '../geolocation/Country';
import { Subdivision } from '../geolocation/Subdivision';
import { Zipcode } from '../geolocation/Zipcode';




export class Prefixes extends Model<InferAttributes<Prefixes>, InferCreationAttributes<Prefixes>>
{
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @NotNull
    @AutoIncrement
    declare id: CreationOptional<number>;


    @Attribute(DataTypes.STRING)
    @NotNull
    declare prefix: string;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare asn_id: number;

    @Attribute(DataTypes.INTEGER)
    @AllowNull
    declare country_id: number | null;

    @Attribute(DataTypes.INTEGER)
    @AllowNull
    declare subdivision_id: number | null;

    @Attribute(DataTypes.INTEGER)
    @AllowNull
    declare city_id: number | null;

    @Attribute(DataTypes.INTEGER)
    @AllowNull
    declare zipcode_id: number | null;

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

    @BelongsTo(() => Country, 'country_id')
    declare country?: NonAttribute<Country>;

    @BelongsTo(() => Subdivision, 'subdivision_id')
    declare subdivision?: NonAttribute<Subdivision>;

    @BelongsTo(() => City, 'city_id')
    declare city?: NonAttribute<City>;

    @BelongsTo(() => Zipcode, 'zipcode_id')
    declare zipcode?: NonAttribute<Zipcode>;

}