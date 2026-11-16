import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { App } from "./App";
import { strings } from "./strings";

it("renders the app name from the strings file", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: strings.appName })).toBeTruthy();
});
