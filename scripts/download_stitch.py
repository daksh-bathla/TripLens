import urllib.request
import os

assets = [
    # 1. Desktop
    {
        "url_img": "https://lh3.googleusercontent.com/aida/AP1WRLu50p19CHWkOHe_xQf2Cr9NW5Epa67fH1XlD2N3v90X5KX9TwRfH-3QvidgE_XWdBgnAJk9z0RhMxWIl5KGu1mlpJjaumvVwgTugm45b9ZLJhsSY1lrkTrqRhvTMzOO5Mf6CT-QQpd9W5o-TAM0lD9Jh4PvWyPFFmWpxWUyTI6DsQSo1VUMUKO6OD60Z_ZIUPRcApfxJzEcSeujuQsABi_Js5_RMW-VVTT_gsDHAUr5wzShKGy-X6wirjo",
        "url_code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzcwMzExYTEyYWNhMjQ0Yjc4NjJjMzRlMTlhOGU3M2JkEgsSBxDn8KyK_hUYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkxMTQ0MDMzNDcwNTU5OTY2Mw&filename=&opi=89354086",
        "name_img": "desktop_screenshot.png",
        "name_code": "desktop_code.html"
    },
    # 2. Mobile
    {
        "url_img": "https://lh3.googleusercontent.com/aida/AP1WRLuiVv3Rr1Ro7BwU0rtsGqHG8Q6k9ha5hyCXBTJFqP0xKhUetcVB7lrzEhfOwNCYARwP6YvhII8zlOa6qCL3aPd6IbpPDdircdI2f_ax_p57w6w25U3712ia1TOHKsIwlBamkDqFzrDd6zle8bAtQIX7oGnShjgMMmmO7rlW2HL6a2GBMytA9ewsQvbjRFWXdwrmM-9HIOFYNVMVagGSa-RQb5JR8Zv6KusBlnUpGjW1BZNIFrUMDbdsYzZT",
        "url_code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzU2ZWRiOTUwMzhmOTQxNDdhZDExMDk0NWNiNzIwNzkzEgsSBxDn8KyK_hUYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkxMTQ0MDMzNDcwNTU5OTY2Mw&filename=&opi=89354086",
        "name_img": "mobile_screenshot.png",
        "name_code": "mobile_code.html"
    },
    # 3. Dining
    {
        "url_img": "https://lh3.googleusercontent.com/aida/AP1WRLsLOWCsKECklLxsDkHEOys7Ux72AYQx8ABDxEqwZkzXctuBQDRn1AV8cSwneeUiZ0xliv8Nvdy2yEll21IzsjRbfkk2euAToZlCcJpfTqPI6lmpeNS4L3A1S9egjvndGyCGry0nDH_LNkdG5c6EiMVOb-kQ6Hy-cGDObt8H6YXNp_p9jX19yseIMUQg1cvFgz4pZI3Sm5rJaxU3dzvVKu9WogtHUaSRTiv84wnVsCxQ5P-OkpYiaKk2BLZC",
        "url_code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzdiNTZhZTcyY2QxNzRkZDBiMTExNjJmOGY0NWMzODBmEgsSBxDn8KyK_hUYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkxMTQ0MDMzNDcwNTU5OTY2Mw&filename=&opi=89354086",
        "name_img": "dining_screenshot.png",
        "name_code": "dining_code.html"
    },
    # 4. Accommodations
    {
        "url_img": "https://lh3.googleusercontent.com/aida/AP1WRLvabCoYeKEUdQWJQUxK_gzj2VTfhbTwLtXd-5qn76MPiK-Js6lYsT1K0GDz4II6Tb8WcODUDeZSPI7AKYIJlnZgT6J8dTTzZRLgXbBnEzKXbeqgE567neL-gQaxg1xM4w7Yh44r254zB6BLSEs0IZys6ESKQbiUJgd3dZVWDyqsj55udA4qhECJiyPAvEvja7frbo582MkhiHA6zDteNn87h4tEEqMm-l5eczZg-vCKmLdmFWFn4JkL4SDK",
        "url_code": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzI0YTJkNzdmOTBiMTRmZTk4YmY0Yzc4NjIwMDFiNDgwEgsSBxDn8KyK_hUYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkxMTQ0MDMzNDcwNTU5OTY2Mw&filename=&opi=89354086",
        "name_img": "accommodations_screenshot.png",
        "name_code": "accommodations_code.html"
    }
]

dest_dir = "stitch_assets"

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

os.makedirs(dest_dir, exist_ok=True)

for item in assets:
    print(f"Downloading {item['name_img']}...")
    try:
        req = urllib.request.Request(item["url_img"], headers=headers)
        with urllib.request.urlopen(req) as response:
            with open(os.path.join(dest_dir, item["name_img"]), "wb") as f:
                f.write(response.read())
        print(f"  Success: {item['name_img']}")
    except Exception as e:
        print(f"  Failed {item['name_img']}: {e}")

    print(f"Downloading {item['name_code']}...")
    try:
        req = urllib.request.Request(item["url_code"], headers=headers)
        with urllib.request.urlopen(req) as response:
            with open(os.path.join(dest_dir, item["name_code"]), "wb") as f:
                f.write(response.read())
        print(f"  Success: {item['name_code']}")
    except Exception as e:
        print(f"  Failed {item['name_code']}: {e}")

print("Done downloading all assets!")
