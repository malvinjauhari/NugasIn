import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App", () => {
  it("renders the template selector", () => {
    render(<App />);
    expect(screen.getByText("Pilih Template")).toBeInTheDocument();
  });

  it("renders the three templates", () => {
    render(<App />);
    expect(screen.getByText("Laporan Praktikum")).toBeInTheDocument();
    expect(screen.getByText("Makalah Akademik")).toBeInTheDocument();
    expect(screen.getByText("Logbook Tugas Besar")).toBeInTheDocument();
  });

  it("renders the preview panel", () => {
    render(<App />);
    expect(screen.getByText("Pilih template untuk memulai")).toBeInTheDocument();
  });
});
