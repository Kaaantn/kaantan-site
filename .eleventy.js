module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

  eleventyConfig.addFilter("tarih", (value) => {
    const d = new Date(value);
    const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return `${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()}`;
  });

  return {
    dir: {
      input: "blog",
      includes: "../_includes",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
