export const validateColors = (
  colors: string[]
): { colorIsValid: boolean; colorValidationMessage: string } => {
  if (colors === undefined) {
    return {
      colorIsValid: false,
      colorValidationMessage: "Field colors is missing",
    };
  }

  if (colors.length < 3 || colors.length > 10) {
    return {
      colorIsValid: false,
      colorValidationMessage: "Wrong array size",
    };
  }

  let hexError = false;
  const hexErrorMessages = [];
  let hexErrorCount = 0;

  for (const color of colors) {
    if (color.length < 4 || color.length > 7) {
      hexError = true;
      hexErrorMessages.push("hex string wrong size at " + (hexErrorCount + 1));
    }

    if (typeof color !== "string") {
      hexError = true;
      hexErrorMessages.push("hex is not a string at " + (hexErrorCount + 1));
    }

    const testHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(color);
    if (!testHex) {
      hexError = true;
      hexErrorMessages.push("no hex color at " + (hexErrorCount + 1));
    }

    hexErrorCount++;
  }

  if (hexError) {
    return {
      colorIsValid: false,
      colorValidationMessage: JSON.stringify(hexErrorMessages),
    };
  }

  return {
    colorIsValid: true,
    colorValidationMessage: "",
  };
};

export const validateTags = (
  tags: string[]
): { tagIsValid: boolean; tagValidationMessage: string } => {
  if (tags.length > 10) {
    return {
      tagIsValid: false,
      tagValidationMessage: "Too much tags",
    };
  }

  let tagError = false;
  const tagErrorMessages = [];
  let tagErrorCount = 0;

  for (const tag of tags) {
    if (tag.length < 3 || tag.length > 10) {
      tagError = true;
      tagErrorMessages.push("tag string wrong size at " + (tagErrorCount + 1));
    }

    if (typeof tag !== "string") {
      tagError = true;
      tagErrorMessages.push("tag is not a string at " + (tagErrorCount + 1));
    }

    tagErrorCount++;
  }

  if (tagError) {
    return {
      tagIsValid: false,
      tagValidationMessage: JSON.stringify(tagErrorMessages),
    };
  }

  return {
    tagIsValid: true,
    tagValidationMessage: "",
  };
};

export const validateId = (id: string): boolean => {
  return id.match(/^[0-9a-fA-F]{24}$/) ? true : false;
};
