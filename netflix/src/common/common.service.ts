import { Injectable } from "@nestjs/common";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { SelectQueryBuilderOption } from "typeorm/query-builder/SelectQueryBuilderOption";
import { PagePaginationDto } from "./dto/page-pagination.dto";
import { CursorPaginationDto } from "./dto/cursor-pagination.dto";

@Injectable()
export class CommonService{
    constructor() {}

    applyPagePaginationParamsToQb<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, dto: PagePaginationDto) {
        const {page, take} = dto;

        const skip = (page - 1) * take;

        qb.take(take);
        qb.skip(skip);
    }

    applyCursorPaginationParamToQb<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, dto: CursorPaginationDto){
        const {order, id, take} = dto;

        if (id) {
            const direction = order === 'ASC' ? '>' : '<';

            qb.where(`${qb.alias}.id ${direction} :id`, {id});
        }

        qb.orderBy(`${qb.alias}.id`, order);

        qb.take(take);

    }
}