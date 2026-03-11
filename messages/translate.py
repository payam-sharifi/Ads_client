import os
import json
from translatepy import Translator

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SOURCE_FILE = os.path.join(BASE_DIR, "en.json")
TARGET_LANGUAGES = {
    "de": os.path.join(BASE_DIR, "de.json"),
    "fa": os.path.join(BASE_DIR, "fa.json")
}


def load_json(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def deep_merge_translate(source, target, lang, translator):
    result = {}

    for key, value in source.items():

        if isinstance(value, dict):
            result[key] = deep_merge_translate(
                value,
                target.get(key, {}),
                lang,
                translator
            )

        elif isinstance(value, str):
            if key in target and target[key]:
                result[key] = target[key]
            else:
                try:
                    translated = translator.translate(value, lang).result
                    print(f"[{lang}] {value} → {translated}")
                    result[key] = translated
                except Exception as e:
                    print(f"Translation error: {value} -> {e}")
                    result[key] = value

        else:
            result[key] = value

    return result


def translate_language(lang, path, source_messages, translator):
    existing = load_json(path)

    merged = deep_merge_translate(
        source_messages,
        existing,
        lang,
        translator
    )

    with open(path, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    print(f"Updated: {path}")


def main():
    translator = Translator()

    source_messages = load_json(SOURCE_FILE)

    for lang, path in TARGET_LANGUAGES.items():
        translate_language(
            lang,
            path,
            source_messages,
            translator
        )


if __name__ == "__main__":
    main()