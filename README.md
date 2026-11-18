# Coupled Multi-Risk Assessment Platform

Online platform: **https://jinzhangzhang.github.io/coupled-risk-platform/**

Browser-based implementation of the coupled multi-risk assessment model described in

> Zhang J, Ni J, Huang H, Guan Z, Hicks MA. A coupled multi-risk assessment model integrating
> consequence amplification and cascading propagation. (Submitted to *Reliability Engineering & System Safety*.)

## What the platform does

1. Lists the risks of an assessment unit with their grades and identifies the target risk
   (most severe grade; ties broken by the priority safety > quality > schedule > investment > ...).
2. Takes the raw coupling coefficient matrix **C** and transfer coefficient matrix **T**
   and applies the grade adjustment factor of Eq. (6).
3. Enumerates the simple paths ending at the target risk, keeps those with
   propagation probability T_k >= T_0, and weights them by p_k = T_k / sum(T_l).
4. Computes the overall amplification factor Lambda = sum(p_k C_k), the coupled grade
   value R^c = R^0 / Lambda and the coupled grade, and exports reports in English or Chinese.

The demo data reproduce the case study of the paper (fault f12, Qingdao Jiaozhou Bay
Second Subsea Tunnel): 8 effective paths at T_0 = 0.03, Lambda = 1.277, R^c = 2.349,
safety risk upgraded from Grade III to Grade II.

## Files

| File | Content |
|---|---|
| `index.html` | Page layout |
| `app.js` | Model calculation, rendering and report export |
| `styles.css` | Styles |
| `report.html` | Report template |
| `assets/` | Images |

The platform is a static web page with no server or database; inputs are stored in the
browser (localStorage). To run it locally, download the repository and open `index.html`.
