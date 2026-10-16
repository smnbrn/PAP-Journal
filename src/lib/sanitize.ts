import sanitizeHtml from "sanitize-html";

/**
 * Pulisce il testo degli articoli prodotto dall'editor: restano solo i tag
 * di formattazione previsti, senza script, stili o attributi pericolosi.
 */
export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
      "a", "ul", "ol", "li", "blockquote", "hr", "img", "figure", "figcaption", "code",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
            : { href: attribs.href ?? "#", ...(attribs.title ? { title: attribs.title } : {}) },
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, alt: attribs.alt ?? "", loading: "lazy" },
      }),
    },
  });
}

/**
 * Testo semplice (moduli dei lettori, risposte). React lo mostra sempre come
 * testo, quindi basta togliere caratteri di controllo e spazi superflui.
 */
export function plainText(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}
