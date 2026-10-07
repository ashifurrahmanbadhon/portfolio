import sqlite3
import json
from datetime import datetime

DB_PATH = 'portfolio.db'

def update_toolghor_data():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    now_str = datetime.now().isoformat()

    # 1. Update Categories
    cur.execute("DELETE FROM toolghor_categories")
    categories = [
        (1, "Document Tools", "documents", "PDF merge, split, compress, PDF to DOCX, Word to PDF and document conversion tools", "file-text", 1, now_str),
        (2, "Image Tools", "images", "Image compress, resize, crop, merge, convert, passport photo, remove background", "image", 2, now_str),
        (3, "Calculators", "calculators", "Live currency rate, BMI, engineering unit, percentage, age and timezone calculators", "scale", 3, now_str),
        (4, "QR Code Tools", "qr", "Custom QR code generator and image QR scanner / decoder", "qr-code", 4, now_str),
        (5, "Video & Audio Tools", "media", "YouTube downloader, audio extractor from video, and social media video cropper", "video", 5, now_str),
        (6, "Resume Builder", "resume", "Professional resume builder and ATS-friendly CV templates", "briefcase", 6, now_str)
    ]
    cur.executemany("""
    INSERT INTO toolghor_categories (id, name, slug, description, icon, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, categories)

    # 2. Update 27 Real Tools
    cur.execute("DELETE FROM toolghor_tools")
    tools = [
        # Category 1: Document Tools (ID: 1)
        (1, 1, "Document Tools", "Merge PDF", "merge-pdf",
         "Combine multiple PDF documents into a single organized file seamlessly.",
         "High-performance in-browser PDF merger using pdf-lib. No external server upload required.",
         "layers", "https://toolghor.com/tools/merge-pdf", "Popular", 1, 1, 1, now_str, now_str),

        (2, 1, "Document Tools", "Split PDF", "split-pdf",
         "Extract selected pages or split large PDF files into separate documents.",
         "Select page ranges (e.g. 1-3, 5, 8-10) and export as individual files or a ZIP archive.",
         "split", "https://toolghor.com/tools/split-pdf", "Essential", 1, 1, 2, now_str, now_str),

        (3, 1, "Document Tools", "Compress PDF", "compress-pdf",
         "Reduce PDF file size without sacrificing readability or image quality.",
         "Optimizes vector paths and embedded raster images to make PDFs email and web ready.",
         "file-down", "https://toolghor.com/tools/compress-pdf", "Popular", 1, 1, 3, now_str, now_str),

        (4, 1, "Document Tools", "PDF to Image", "pdf-to-image",
         "Convert PDF pages to high-resolution PNG or JPG image files.",
         "Render each page with crisp DPI scaling and download individually or in a ZIP bundle.",
         "file-image", "https://toolghor.com/tools/pdf-to-image", "Utility", 0, 1, 4, now_str, now_str),

        (5, 1, "Document Tools", "PDF to Word (DOCX)", "pdf-to-doc",
         "Convert PDF documents into fully editable Microsoft Word (.docx) documents.",
         "Preserves font styling, paragraphs, and tables for easy editing in MS Word and Google Docs.",
         "file-text", "https://toolghor.com/tools/pdf-to-doc", "Hot", 1, 1, 5, now_str, now_str),

        (6, 1, "Document Tools", "Word to PDF", "word-to-pdf",
         "Convert DOC and DOCX Word documents into standardized PDF format.",
         "High-fidelity document rendering maintaining pagination, margins, and formatting.",
         "file-check", "https://toolghor.com/tools/word-to-pdf", "Popular", 1, 1, 6, now_str, now_str),

        # Category 2: Image Tools (ID: 2)
        (7, 2, "Image Tools", "JPG to PDF", "jpg-to-pdf",
         "Convert JPG, PNG, and WebP images into a single multi-page PDF document.",
         "Arrange images in custom sequence, choose page orientations, and export instantly.",
         "file-plus", "https://toolghor.com/tools/jpg-to-pdf", "Popular", 1, 1, 7, now_str, now_str),

        (8, 2, "Image Tools", "Compress Image", "compress-image",
         "Reduce image file size significantly while retaining maximum visual clarity.",
         "Lossy and lossless compression for JPEG, PNG, and WebP images with preview comparison.",
         "image-down", "https://toolghor.com/tools/compress-image", "Essential", 1, 1, 8, now_str, now_str),

        (9, 2, "Image Tools", "Resize Image", "resize-image",
         "Scale images to exact pixel dimensions, percentage ratios, or specific file sizes.",
         "Custom aspect ratio locking, standard preset resolutions (HD, 4K, social avatars).",
         "maximize-2", "https://toolghor.com/tools/resize-image", "Utility", 0, 1, 9, now_str, now_str),

        (10, 2, "Image Tools", "Crop Image", "crop-image",
         "Trim and crop unwanted areas from photos with custom or fixed aspect ratios.",
         "Visual canvas cropper supporting 1:1 square, 16:9 banner, 4:3 photo, and freeform crop.",
         "crop", "https://toolghor.com/tools/crop-image", "Utility", 0, 1, 10, now_str, now_str),

        (11, 2, "Image Tools", "Merge Image", "merge-image",
         "Stitch and combine multiple photos side-by-side or stacked vertically.",
         "Create photo collages, before/after comparisons, and panoramic banner stitches.",
         "layers", "https://toolghor.com/tools/merge-image", "Creative", 0, 1, 11, now_str, now_str),

        (12, 2, "Image Tools", "Convert Image", "convert-image",
         "Convert images between JPG, PNG, WebP, GIF, and SVG formats instantly.",
         "Batch image format converter running completely in your browser with zero data leakage.",
         "repeat", "https://toolghor.com/tools/convert-image", "Essential", 1, 1, 12, now_str, now_str),

        (13, 2, "Image Tools", "Passport Size Photo", "passport-photo",
         "Create official passport & visa photos (35x45mm, 300x300px) with custom white/blue background.",
         "Adheres to international visa and Bangladesh government passport photo specifications.",
         "id-card", "https://toolghor.com/tools/passport-photo", "Popular", 1, 1, 13, now_str, now_str),

        (14, 2, "Image Tools", "Remove Background", "remove-background",
         "Isolate subjects and create transparent PNGs or replace with solid studio backgrounds.",
         "AI-driven and canvas boundary edge detection for instant e-commerce and portrait cutouts.",
         "eraser", "https://toolghor.com/tools/remove-background", "AI Powered", 1, 1, 14, now_str, now_str),

        # Category 3: Calculators (ID: 3)
        (15, 3, "Calculators", "Live Currency Converter", "currency-converter",
         "Real-time currency exchange rates for BDT, USD, EUR, GBP, SAR, AED and 150+ currencies.",
         "Live forex data feed with instant calculations and historical trends.",
         "coins", "https://toolghor.com/tools/currency-converter", "Live Rates", 1, 1, 15, now_str, now_str),

        (16, 3, "Calculators", "BMI Calculator", "bmi-calculator",
         "Calculate Body Mass Index (BMI), healthy weight ranges, and body category.",
         "Supports metric (cm/kg) and imperial (ft/in/lbs) units with WHO health classifications.",
         "scale", "https://toolghor.com/tools/bmi-calculator", "Health", 0, 1, 16, now_str, now_str),

        (17, 3, "Calculators", "Unit Converter", "unit-converter",
         "Universal metric and imperial converter for length, weight, area, volume, temperature, and speed.",
         "Multi-category conversion matrix with high scientific precision for engineering tasks.",
         "ruler", "https://toolghor.com/tools/unit-converter", "Utility", 1, 1, 17, now_str, now_str),

        (18, 3, "Calculators", "Percentage Calculator", "percentage-calculator",
         "Quick percentage calculations: percentage of, percentage change, increase/decrease, and discount.",
         "Instant answers for business discounts, academic marks, exam scores, and financial margins.",
         "percent", "https://toolghor.com/tools/percentage-calculator", "Math", 0, 1, 18, now_str, now_str),

        (19, 3, "Calculators", "Age Calculator", "age-calculator",
         "Calculate exact age in years, months, days, hours, and find upcoming birthday countdowns.",
         "Provides total days lived, day of week born, and age milestones calculation.",
         "calendar", "https://toolghor.com/tools/age-calculator", "Utility", 0, 1, 19, now_str, now_str),

        (20, 3, "Calculators", "Time Zone Converter", "time-zone-converter",
         "Compare and schedule across global time zones (BST, UTC, EST, PST, GMT, IST, etc.).",
         "Visual time comparison slider for scheduling international meetings and developer syncs.",
         "clock", "https://toolghor.com/tools/time-zone-converter", "Productivity", 0, 1, 20, now_str, now_str),

        # Category 4: QR Code Tools (ID: 4)
        (21, 4, "QR Code Tools", "QR Code Generator", "qr-generator",
         "Generate customizable QR codes for URLs, WiFi networks, vCards, text, and WhatsApp.",
         "Custom color schemes, corner radiuses, and high-res SVG/PNG download support.",
         "qr-code", "https://toolghor.com/tools/qr-generator", "Popular", 1, 1, 21, now_str, now_str),

        (22, 4, "QR Code Tools", "QR Code Decoder", "qr-decoder",
         "Scan and decode QR codes from image files, screenshots, or device camera feed.",
         "Zero external API calls. Decodes URLs, contact info, and text directly on client canvas.",
         "scan", "https://toolghor.com/tools/qr-decoder", "Utility", 0, 1, 22, now_str, now_str),

        # Category 5: Video & Audio Tools (ID: 5)
        (23, 5, "Video & Audio Tools", "YouTube Downloader", "youtube-downloader",
         "Download YouTube videos and audio in MP4, WebM, and MP3 formats.",
         "Fast media extractor supporting various video qualities and audio extraction.",
         "download", "https://toolghor.com/tools/youtube-downloader", "Popular", 1, 1, 23, now_str, now_str),

        (24, 5, "Video & Audio Tools", "Audio Extractor", "audio-extractor",
         "Extract crystal clear MP3, WAV, or AAC audio tracks from video files.",
         "In-browser Web Audio API extraction supporting MP4, MOV, WebM, and AVI formats.",
         "music", "https://toolghor.com/tools/audio-extractor", "Media", 1, 1, 24, now_str, now_str),

        (25, 5, "Video & Audio Tools", "Social Media Video Cropper", "social-video-cropper",
         "Crop and resize videos for Instagram Reels (9:16), TikTok, YouTube Shorts, and feeds (1:1).",
         "Interactive video frame positioning, canvas playback, and social-ready exporting.",
         "video", "https://toolghor.com/tools/social-video-cropper", "Creator", 0, 1, 25, now_str, now_str),

        # Category 6: Resume Builder (ID: 6)
        (26, 6, "Resume Builder", "Professional Resume", "resume-builder",
         "Build modern, ATS-friendly resumes and CVs with real-time PDF generation.",
         "Clean typography, customizable sections, skills tags, and instant download.",
         "file-badge", "https://toolghor.com/tools/resume-builder", "Career", 1, 1, 26, now_str, now_str),

        (27, 6, "Resume Builder", "CV Templates", "cv-templates",
         "Curated gallery of downloadable modern CV and resume templates for engineers & developers.",
         "Ready-to-use template designs optimized for corporate recruitment and tech job applications.",
         "layout-template", "https://toolghor.com/tools/cv-templates", "Templates", 1, 1, 27, now_str, now_str)
    ]
    cur.executemany("""
    INSERT INTO toolghor_tools (
        id, category_id, category_name, name, slug, short_description, full_description,
        icon, url, badge, is_featured, is_active, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, tools)

    # 3. Update ToolGhor Settings
    cur.execute("""
    UPDATE toolghor_settings SET
        site_title = 'ToolGhor - All-in-One Web Tools & Utilities Platform',
        tagline = 'Everyday tools, now on one platform • দৈনন্দিন কাজের সব টুলস, এখন এক প্ল্যাটফর্মে',
        hero_headline = 'All Your Essential Web Tools in One Place',
        hero_subheadline = 'Free, fast & secure online tools for documents, images, calculators, QR codes, video/audio & resume building. 100% private in-browser processing.',
        announcement_banner = '⚡ ToolGhor Live: 27+ powerful tools for PDF, image, calculators, QR & media processing!',
        footer_text = 'ToolGhor © {year} • Engineered with precision by Ashifur Rahman. All rights reserved.',
        updated_at = ?
    WHERE id = 1
    """, (now_str,))

    # 4. Update websites table description for ToolGhor
    cur.execute("""
    UPDATE websites SET
        description = 'All-in-one web tools platform with 27+ document, image, calculator, QR, media & resume utilities.',
        updated_at = ?
    WHERE slug = 'toolghor'
    """, (now_str,))

    conn.commit()

    # Verify counts
    cur.execute("SELECT COUNT(*) FROM toolghor_categories")
    cat_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM toolghor_tools")
    tool_count = cur.fetchone()[0]

    conn.close()
    print(f"SUCCESS: Seeded {cat_count} ToolGhor categories and {tool_count} real ToolGhor tools.")

if __name__ == '__main__':
    update_toolghor_data()
