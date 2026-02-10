import os
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Navigate to the app
    try:
        page.goto("http://localhost:3000")
    except Exception as e:
        print(f"Failed to navigate: {e}")
        browser.close()
        return

    # 2. Check title
    try:
        title = page.locator("h1")
        print(f"Found title: {title.inner_text()}")
        if "Shipment Reward Calculator" not in title.inner_text():
            print("Title incorrect!")
    except Exception as e:
        print(f"Error finding title: {e}")

    # 3. Upload file
    file_path = os.path.abspath("sample.xlsx")
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        # Create a dummy one if missing (though it should be there)

    print(f"Uploading {file_path}")
    try:
        page.set_input_files('input[type="file"]', file_path)
    except Exception as e:
        print(f"Error uploading file: {e}")

    # 4. Wait for preview table
    try:
        page.wait_for_selector("text=Preview (First 5 Rows)", timeout=5000)
        print("Preview table appeared.")
    except Exception as e:
        print(f"Preview table did not appear: {e}")

    # 5. Check for content
    content = page.content()
    if "Alice" in content:
        print("Alice found in table.")
    else:
        print("Alice NOT found in table.")

    # 6. Take screenshot
    screenshot_path = "/home/jules/verification/dashboard_preview.png"
    page.screenshot(path=screenshot_path, full_page=True)
    print(f"Screenshot saved to {screenshot_path}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
