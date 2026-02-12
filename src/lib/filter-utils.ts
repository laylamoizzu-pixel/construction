
export type FilterState = {
    minPrice?: number;
    maxPrice?: number;
    categories?: string[];
    rating?: number;
    sort?: string;
    search?: string;
    available?: boolean;
};

export const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Top Rated", value: "rating" },
];

export function parseSearchParams(searchParams: URLSearchParams): FilterState {
    return {
        minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
        maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
        categories: searchParams.getAll("category"),
        rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
        sort: searchParams.get("sort") || "newest",
        search: searchParams.get("search") || undefined,
        available: searchParams.get("available") === "true",
    };
}

export function buildSearchParams(currentState: FilterState): URLSearchParams {
    const params = new URLSearchParams();
    if (currentState.minPrice) params.set("minPrice", currentState.minPrice.toString());
    if (currentState.maxPrice) params.set("maxPrice", currentState.maxPrice.toString());
    if (currentState.categories) currentState.categories.forEach(c => params.append("category", c));
    if (currentState.rating) params.set("rating", currentState.rating.toString());
    if (currentState.sort) params.set("sort", currentState.sort);
    if (currentState.search) params.set("search", currentState.search);
    if (currentState.available) params.set("available", "true");
    return params;
}
