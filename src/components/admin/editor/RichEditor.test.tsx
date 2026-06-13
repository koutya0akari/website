// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RichEditor } from "./RichEditor";

function setScrollableSize(element: HTMLElement, scrollHeight: number, clientHeight: number) {
  Object.defineProperties(element, {
    scrollHeight: { configurable: true, value: scrollHeight },
    clientHeight: { configurable: true, value: clientHeight },
  });
}

function waitForAnimationFrame() {
  return act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
}

describe("RichEditor scroll behavior", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 720,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps editor and preview scroll independent in split view", async () => {
    render(
      <RichEditor
        value={["# Title", "本文", "## Section", "More text"].join("\n\n")}
        onChange={vi.fn()}
        minHeight={240}
      />,
    );

    const editor = screen.getByLabelText("エディター") as HTMLTextAreaElement;
    const preview = screen.getByLabelText("プレビュー") as HTMLDivElement;
    const container = screen.getByTestId("rich-editor-container");
    const editorPane = screen.getByTestId("rich-editor-editor-pane");
    const previewPane = screen.getByTestId("rich-editor-preview-pane");

    await waitForAnimationFrame();

    expect(container.style.height).toBe("696px");
    expect(editorPane.className).toContain("h-full");
    expect(previewPane.className).toContain("h-full");
    expect(screen.queryByRole("button", { name: /独立スクロール/ })).toBeNull();
    setScrollableSize(editor, 1_000, 200);
    setScrollableSize(preview, 800, 200);

    editor.scrollTop = 400;
    fireEvent.scroll(editor);
    expect(preview.scrollTop).toBe(0);

    preview.scrollTop = 300;
    fireEvent.scroll(preview);
    expect(editor.scrollTop).toBe(400);
  });

  it("uses a minimum viewport height when the available space is too small", async () => {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 280,
    });

    render(
      <RichEditor
        value="# Title"
        onChange={vi.fn()}
        minHeight={500}
      />,
    );

    await waitForAnimationFrame();

    expect(screen.getByTestId("rich-editor-container").style.height).toBe("320px");
  });
});
