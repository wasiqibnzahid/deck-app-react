import { chakra, Select } from "@chakra-ui/react";

export const CustomSelect = chakra(Select, {
  baseStyle: {
    option: {
      //   backgroundColor: "blue.500", // Background color for each option
      color: "black", // Text color for each option
    },
  },
});
