import StyleDictionary from "style-dictionary";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { transforms, transformTypes } from "style-dictionary/enums";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { attributeCti, nameConstant, sizePx, colorCss, timeSeconds } =
  transforms;
const { value: transformTypeValue, name } = transformTypes;

console.log("Build started...");
console.log("\n==============================================");

// REGISTER THE CUSTOM TRANSFORMS

/**
 * In this example, we are overriding custom transforms to handle different cti values and applying transformations based on these values.
 */
StyleDictionary.registerTransform({
  name: sizePx,
  type: transformTypeValue,
  filter: function (token) {
    return token.type === "fontSize" || token.type === "dimension";
  },
  transform: function (token) {
    return `${token.value}px`;
  },
});

/**
 * In this example, we are using a custom attribute, declared in the token, to match the values where apply the transform
 */
StyleDictionary.registerTransform({
  name: "ratio/%",
  type: transformTypeValue,
  filter: function (token) {
    //
    return token.type === "ratio";
  },
  transform: function (token) {
    return `${Math.floor(100 * token.value)}%`;
  },
});

/**
 * In this example we assume colors are always in the format #xxxxxx
 */
StyleDictionary.registerTransform({
  name: "hexRGB/hexARGB",
  type: transformTypeValue,
  filter: function (token) {
    return token.type === "color";
  },
  transform: function (token) {
    return token.value.replace(/^#/, "#FF");
  },
});

/**
 * In this example, we change the unit type, because in Android font sizes are expressed in "sp" units
 */
StyleDictionary.registerTransform({
  name: "unitless/sp",
  type: transformTypeValue,
  filter: function (token) {
    return token.type === "fontSize";
  },
  transform: function (token) {
    return `${token.value}sp`;
  },
});

/**
 *  This is a silly example, to show how you can apply transform to names
 *  notice: if you don't specify a filter, the transformation will be applied to all the tokens
 */
StyleDictionary.registerTransform({
  name: "name/squiggle",
  type: name,

  transform: function (token) {
    return token.path.join("~");
  },
});

// REGISTER THE CUSTOM TRANSFORM GROUPS

// if you want to see what a pre-defined group contains, uncomment the next line:
// console.log(StyleDictionary.transformGroup['group_name']);

/**
 * In this example, we combine different pre-defined transforms and custom ones
 */
StyleDictionary.registerTransformGroup({
  name: "custom/web",
  // notice: here the "size/px" transform is not the pre-defined one, but the custom one we have declared above
  transforms: [
    attributeCti,
    nameConstant,
    sizePx,
    colorCss,
    timeSeconds,
    "ratio/%",
  ],
});

/**
 * In this example, we combine different pre-defined transforms and custom ones, by concating them
 */
StyleDictionary.registerTransformGroup({
  name: "custom/scss",
  transforms: StyleDictionary.hooks.transformGroups.scss.concat([
    sizePx,
    "ratio/%",
  ]),
});

/**
 * In this example, we are completely ignoring the "attribute/cti" transform (it's totally possible),
 * because we are relying on custom attributes for the filters and the custom format for the output
 */
StyleDictionary.registerTransformGroup({
  name: "custom/android",
  //
  transforms: ["name/squiggle", "hexRGB/hexARGB"],
});

// REGISTER A CUSTOM FORMAT (to be used for this specific example)

StyleDictionary.registerFormat({
  name: "custom/android/xml",
  format: function ({ dictionary }) {
    return dictionary.allTokens
      .map(function (token) {
        return `<item name="${token.name}">${token.value}</item>`;
      })
      .join("\n");
  },
});

// APPLY THE CONFIGURATION
// IMPORTANT: the registration of custom transforms
// needs to be done _before_ applying the configuration
const sd = new StyleDictionary(__dirname + "/config.json");

// FINALLY, BUILD ALL THE PLATFORMS
await sd.buildAllPlatforms();

console.log("\n==============================================");
console.log("\nBuild completed!");
