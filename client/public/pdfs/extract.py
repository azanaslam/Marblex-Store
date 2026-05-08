import fitz  # PyMuPDF
import os
import glob

pdf_files = glob.glob("*.pdf")
output_dir = "extracted_images"
os.makedirs(output_dir, exist_ok=True)

for pdf_file in pdf_files:
    pdf_name = os.path.splitext(os.path.basename(pdf_file))[0]
    print(f"Processing {pdf_file}...")
    try:
        doc = fitz.open(pdf_file)
        for i in range(len(doc)):
            page = doc.load_page(i)
            # Increase resolution with a matrix
            zoom = 2.0  # 2x zoom for better resolution
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            output_path = os.path.join(output_dir, f"{pdf_name}_page_{i+1}.png")
            pix.save(output_path)
            print(f"Saved {output_path}")
    except Exception as e:
        print(f"Error processing {pdf_file}: {e}")
