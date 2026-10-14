import re

with open('frontend/avero-next/lib/mockProducts.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
current_id = None
for line in lines:
    m = re.search(r"article_id:\s*'(\d+)'", line)
    if m:
        current_id = m.group(1)
    if 'image_url:' in line and current_id:
        line = f"    image_url: '/catalog/{current_id}.jpg',\n"
    new_lines.append(line)

with open('frontend/avero-next/lib/mockProducts.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Updated mockProducts.ts successfully!')
