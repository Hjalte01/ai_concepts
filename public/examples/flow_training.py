"""Small unguided PyTorch training comparison, not a reproduction of image results.
Install PyTorch separately; run: python flow_training.py
The browser lab needs no PyTorch and uses explicit scalar derivatives instead.
"""
import copy
import torch
from torch import nn
from torch.func import jvp


class Field(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(3, 32), nn.Tanh(), nn.Linear(32, 1))

    def forward(self, z, r, t):
        return self.net(torch.cat((z, r, t), dim=-1))


def objective(model, x, noise, r, t, method):
    z = (1 - t) * x + t * noise
    conditional = noise - x
    if method == 'fm':
        # FM needs only t; zeroing r removes the extra input.
        return (model(z, torch.zeros_like(r), t) - conditional).square().mean()
    direction = conditional if method == 'mf' else model(z, t, t).detach()
    u, dudt = jvp(model, (z, r, t),
                  (direction, torch.zeros_like(r), torch.ones_like(t)))
    # MF and iMF both stop the derivative correction. The direction differs.
    prediction = u + (t - r) * dudt.detach()
    return (prediction - conditional).square().mean()


def main():
    torch.manual_seed(7)
    initial = Field()
    models = {name: copy.deepcopy(initial) for name in ('fm', 'mf', 'imf')}
    optimizers = {name: torch.optim.Adam(model.parameters(), lr=1e-3)
                  for name, model in models.items()}
    for step in range(200):
        # Same fresh batch and times for all methods; mixture of two 1D clusters.
        x = 2 * (2 * torch.randint(0, 2, (64, 1)) - 1) + .3 * torch.randn(64, 1)
        noise = torch.randn_like(x)
        times = torch.rand(64, 2).sort(dim=1).values
        r, t = times[:, :1], times[:, 1:]
        r = torch.where(torch.rand_like(r) < .25, t, r)  # boundary examples
        for name, model in models.items():
            optimizer = optimizers[name]
            optimizer.zero_grad()
            loss = objective(model, x, noise, r, t, name)
            loss.backward()
            optimizer.step()
            if step % 50 == 0:
                print(name, step, float(loss.detach()))
    # These are tiny, incompletely trained models. Inspect outputs; do not infer
    # relative image quality from these losses or this short run.
    with torch.no_grad():
        noise = torch.randn(8, 1)
        for name, model in models.items():
            z = noise.clone()
            steps = 40 if name == 'fm' else 1
            for i in range(steps):
                t = torch.full_like(z, 1 - i / steps)
                r = t - 1 / steps
                velocity = model(z, torch.zeros_like(r) if name == 'fm' else r, t)
                z = z - velocity / steps
            print(name, 'generated scalar samples:', z.flatten().tolist())


if __name__ == '__main__':
    main()
