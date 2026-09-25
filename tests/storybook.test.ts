import { describe, expect, it } from "@rstest/core";
import { classifyFile } from "../src/classifier/heuristics.js";
import { analyzeStorybook, isStorybookFile } from "../src/classifier/storybook.js";

describe("Storybook Play Function Coverage Depth Analysis", () => {
  it("identifies storybook files accurately", () => {
    expect(isStorybookFile("src/components/Button.stories.tsx")).toBe(true);
    expect(isStorybookFile("src/components/Button.stories.jsx")).toBe(true);
    expect(isStorybookFile("src/components/Button.test.tsx")).toBe(false);
  });

  it("classifies Level 1: Visual catalog (no play function) as visual/static without inflating test count", () => {
    const code = `
      import type { Meta, StoryObj } from '@storybook/react'
      import { Button } from './Button'

      const meta: Meta<typeof Button> = { component: Button }
      export default meta

      export const Primary: StoryObj<typeof Button> = {
        args: { label: 'Click me' }
      }
    `;
    const analysis = analyzeStorybook("Button.stories.tsx", code);
    expect(analysis.depthLevel).toBe(1);
    expect(analysis.playCount).toBe(0);
    expect(analysis.layer).toBe("static");

    const fileResult = classifyFile("Button.stories.tsx", code);
    expect(fileResult.layer).toBe("static");
    expect(fileResult.testCaseCount).toBe(0);
  });

  it("classifies Level 2: Shallow interaction (userEvent without assertions) as interaction smoke", () => {
    const code = `
      export const Clicking: Story = {
        play: async ({ canvasElement }) => {
          const button = canvasElement.querySelector('button')
          await userEvent.click(button)
        }
      }
    `;
    const analysis = analyzeStorybook("Button.stories.tsx", code);
    expect(analysis.depthLevel).toBe(2);
    expect(analysis.playCount).toBe(1);
    expect(analysis.assertionCount).toBe(0);
    expect(analysis.layer).toBe("integration");
  });

  it("classifies Level 3: Full component integration (play + expect assertions) as true Component Integration", () => {
    const code = `
      import { expect, userEvent, within } from '@storybook/test'

      export const FormSubmission: Story = {
        play: async ({ canvasElement }) => {
          const canvas = within(canvasElement)
          const submitBtn = canvas.getByRole('button', { name: /submit/i })
          await userEvent.type(canvas.getByLabelText(/email/i), 'user@example.com')
          await userEvent.click(submitBtn)

          await expect(canvas.getByText(/thank you/i)).toBeInTheDocument()
          await expect(submitBtn).toBeDisabled()
        }
      }
    `;
    const analysis = analyzeStorybook("SignupForm.stories.tsx", code);
    expect(analysis.depthLevel).toBe(3);
    expect(analysis.playCount).toBe(1);
    expect(analysis.assertionCount).toBe(2);
    expect(analysis.layer).toBe("integration");

    const fileResult = classifyFile("SignupForm.stories.tsx", code);
    expect(fileResult.layer).toBe("integration");
    expect(fileResult.testCaseCount).toBe(2); // 2 assertions
    expect(fileResult.reasons[0]).toContain("Level 3");
  });

  it("classifies Level 4: MSW mocked service integration as high integration tier", () => {
    const code = `
      import { expect, within } from '@storybook/test'
      import { http, HttpResponse } from 'msw'

      export const SuccessState: Story = {
        parameters: {
          msw: {
            handlers: [
              http.get('/api/user', () => HttpResponse.json({ name: 'Alice' })),
            ],
          },
        },
        play: async ({ canvasElement }) => {
          const canvas = within(canvasElement)
          await expect(await canvas.findByText('Alice')).toBeVisible()
        }
      }
    `;
    const analysis = analyzeStorybook("UserProfile.stories.tsx", code);
    expect(analysis.depthLevel).toBe(4);
    expect(analysis.hasMsw).toBe(true);
    expect(analysis.layer).toBe("integration");
  });
});
