import re
from urllib.parse import urlparse

def extract_url_features(url: str):
    url = url.lower()

    features = {}

    # --- Core lexical features ---
    features["URLLength"] = len(url)
    features["IsDomainIP"] = 1 if any(char.isdigit() for char in url.split("//")[-1].split("/")[0]) else 0
    features["IsHTTPS"] = 1 if url.startswith("https") else 0
    features["NoOfSubDomain"] = url.count('.') - 1

    # --- Suspicious keywords ---
    suspicious_words = [
        "login","secure","update","verify","account","confirm",
        "signin","bank","paypal","google","apple","facebook",
        "microsoft","billing","payment","support","security",
        "alert","wallet"
    ]

    brand_words = [
        "google","paypal","facebook","amazon",
        "apple","microsoft","netflix","bank"
    ]

    keyword_hits = sum(1 for w in suspicious_words if w in url)
    brand_hits = sum(1 for b in brand_words if b in url)

    hyphen_count = url.count("-")

    has_suspicious = int(
        keyword_hits >= 1 or
        brand_hits >= 1 or
        hyphen_count >= 2
    )
    features["StatsReport"] = keyword_hits + brand_hits + hyphen_count
   

    features["RequestURL"] = has_suspicious
    features["AnchorURL"] = has_suspicious
    features["ServerFormHandler"] = has_suspicious

    # --- Safe defaults for remaining training features ---
    SAFE_DEFAULTS = [
        "HasTitle","HasFavicon","HasDescription","HasExternalFormSubmit",
        "HasSubmitButton","HasHiddenFields","HasPasswordField",
        "NoOfPopup","NoOfiFrame","IsResponsive","Robots",
        "NoOfURLRedirect","NoOfSelfRedirect","HasSocialNet",
        "Bank","Pay","Crypto","HasCopyrightInfo",
        "NoOfImage","NoOfCSS","NoOfJS","NoOfSelfRef",
        "NoOfEmptyRef","NoOfExternalRef",
        "LineOfCode","LargestLineLength",
        "NoOfLettersInURL","LetterRatioInURL",
        "NoOfDegitsInURL","DegitRatioInURL",
        "NoOfEqualsInURL","NoOfQMarkInURL",
        "NoOfAmpersandInURL","NoOfOtherSpecialCharsInURL",
        "SpacialCharRatioInURL",
        "URLSimilarityIndex","CharContinuationRate",
        "TLDLegitimateProb","URLCharProb","TLDLength",
        "HasObfuscation","NoOfObfuscatedChar","ObfuscationRatio",
        "DomainTitleMatchScore","URLTitleMatchScore"
    ]

    for col in SAFE_DEFAULTS:
        features[col] = 0

    return features
