export const criteriaConverter = criteria => {
    const sequelizeOptions = {};

    if (criteria.limit && criteria.pageNumber) {
        sequelizeOptions.limit = criteria.limit;
        sequelizeOptions.offset = (criteria.pageNumber - 1) * criteria.limit;
    }

    if (criteria.sortBy && criteria.sortBy.length > 0) {
        sequelizeOptions.order = criteria.sortBy.map(sort => [sort.column, sort.direction.toUpperCase()]);
    }

    sequelizeOptions.district = true;

    return sequelizeOptions;
};
