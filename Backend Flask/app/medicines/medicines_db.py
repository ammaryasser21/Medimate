from datasets import load_dataset # type: ignore
from flask import request, jsonify

dataset = load_dataset("rifatul123/NoN_generic_248218_type_indian_drug_cleaned")
medicines = dataset["train"].to_list()
ITEMS_PER_PAGE = 6

def get_medicines_data(): # Function to get medicine data for endpoint
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', ITEMS_PER_PAGE))
    search_query = request.args.get('search', '').lower()
    selected_classes = request.args.get('classes', '').split(',') if request.args.get('classes') else []
    selected_uses = request.args.get('uses', '').split(',') if request.args.get('uses') else []

    filtered_medicines = medicines
    if search_query:
        filtered_medicines = [m for m in filtered_medicines if search_query in m.get('NAME', '').lower()]

    if selected_classes:
        filtered_medicines = [m for m in filtered_medicines if any(cls.strip() in [c.strip() for c in m.get('CLASS', '').split(',')] for cls in selected_classes)]
    if selected_uses:
        filtered_medicines = [m for m in filtered_medicines if any(use.strip() in [u.strip() for u in m.get('Uses', '').split(',')] for use in selected_uses)]

    total_items = len(filtered_medicines)
    total_pages = (total_items + limit - 1) // limit
    start = (page - 1) * limit
    end = start + limit
    paginated_medicines = filtered_medicines[start:end]

    response_medicines = [
        {
            "id": index + 1,
            "NAME": med.get('NAME', 'Unknown'),
            "CLASS": [cls.strip() for cls in med.get('CLASS', '').split(',')] if med.get('CLASS') else [],
            "Uses": [use.strip() for use in med.get('Uses', '').split(',')] if med.get('Uses') else [],
            "SIDEEFFECT": [effect.strip() for effect in med.get('SIDEEFFECT', '').split(',')] if med.get('SIDEEFFECT') else []
        }
        for index, med in enumerate(paginated_medicines)
    ]

    all_classes = sorted(set(cls.strip() for med in medicines for cls in med.get('CLASS', '').split(',') if cls))
    all_uses = sorted(set(use.strip() for med in medicines for use in med.get('Uses', '').split(',') if use))

    response = {
        "medicines": response_medicines,
        "totalPages": total_pages,
        "totalItems": total_items,
        "classes": all_classes,
        "uses": all_uses
    }
    return response # Return dictionary, jsonify in main.py