ARTICLE_REQUIRED_COLUMNS = {
    "article_id",
    "product_type_no",
    "product_group_name",
    "colour_group_code",
    "department_no",
    "section_no",
    "garment_group_no",
}

CUSTOMER_REQUIRED_COLUMNS = {
    "customer_id",
    "club_member_status",
    "fashion_news_frequency",
    "age",
    "postal_code",
}

TRANSACTION_REQUIRED_COLUMNS = {
    "t_dat",
    "customer_id",
    "article_id",
    "price",
    "sales_channel_id",
}
