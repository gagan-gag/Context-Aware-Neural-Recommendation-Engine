with open('frontend/avero-next/lib/mockProducts.ts', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "product_name: 'Classic Crewneck Tee'": "product_name: 'Classic Crewneck Jersey Top'",
    "product_name: 'Kids Cotton Romper'": "product_name: 'Kids Organic Cotton Romper'",
    "product_name: 'Kids Striped Polo Tee'": "product_name: 'Kids Striped Cotton Tee'",
    "product_name: 'Minimalist Chelsea Boots'": "product_name: 'Minimalist Leather Chelsea Boots'",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('frontend/avero-next/lib/mockProducts.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated mockProducts.ts names successfully!')
