import os

# Paths
base_dir = "c:\\web-project\\htdocs\\ghar_kharch"
font_base64_path = os.path.join(base_dir, "scratch", "font-base64.txt")
index_html_path = os.path.join(base_dir, "index.html")

print("Reading Base64 font data...")
with open(font_base64_path, "r", encoding="utf-8") as f:
    base64_data = f.read().replace("\n", "").replace("\r", "").strip()

print(f"Read {len(base64_data)} characters of Base64 data.")

print("Reading index.html...")
with open(index_html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

target_str = "src: url('/fonts/Quicksand-700.ttf') format('truetype');"
replacement_str = f"src: url('data:font/ttf;charset=utf-8;base64,{base64_data}') format('truetype');"

if target_str in html_content:
    print("Found target font link in index.html. Inlining font...")
    new_html_content = html_content.replace(target_str, replacement_str)
    
    with open(index_html_path, "w", encoding="utf-8") as f:
        f.write(new_html_content)
    print("✔ Successfully inlined Quicksand-700.ttf into index.html!")
else:
    print("❌ Could not find target font link in index.html. Please check index.html content.")
