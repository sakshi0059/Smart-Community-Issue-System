// import { useEffect } from "react";

// const GoogleTranslate = () => {
//   useEffect(() => {
//     const addScript = document.createElement("script");
//     addScript.src =
//       "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
//     addScript.async = true;

//     document.body.appendChild(addScript);

//     window.googleTranslateElementInit = () => {
//       new window.google.translate.TranslateElement(
//         {
//           pageLanguage: "en",
//           includedLanguages: "en,hi,mr",
//           autoDisplay: false,
//         },
//         "google_translate_element"
//       );
//     };
//   }, []);

//   return <div id="google_translate_element"></div>;
// };

// export default GoogleTranslate;



import { useEffect } from "react";

const GoogleTranslate = () => {

  useEffect(() => {

    // Prevent multiple script loading
    if (window.googleTranslateInitialized) return;

    window.googleTranslateInitialized = true;

    const addScript = document.createElement("script");
    addScript.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    addScript.async = true;

    document.body.appendChild(addScript);

    window.googleTranslateElementInit = () => {
      if (!window.google || !window.google.translate) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,bn,gu,kn,ml,mr,pa,ta,te,ur",
        //   includedLanguages: "en,hi,mr",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

  }, []);

  return <div id="google_translate_element"></div>;
};

export default GoogleTranslate;