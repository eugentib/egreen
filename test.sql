SELECT
    devices.mac,
    devices.nrmag,
    devices.magazin,
    COALESCE(
        COALESCE(
            MAX(
                CASE
                    WHEN stat_baloti.data <= '2024-01-31 23:59:59' THEN stat_baloti.nrBalot     #1995
                END
            ),
            MIN(
                CASE
                    WHEN stat_baloti.data >= '2024-01-31 23:59:59' THEN stat_baloti.nrBalot     #2000
                END
            )
        ) - COALESCE(
            MAX(
                CASE
                    WHEN stat_baloti.data < '2024-01-31 01:00:00' THEN stat_baloti.nrBalot      #1993
                END
            ),
            MIN(
                CASE
                    WHEN stat_baloti.data > '2024-01-31 01:00:00' THEN stat_baloti.nrBalot      #1994
                END
            )
        ),
        0
    ) AS 'ian. 2024',
    COALESCE(
        COALESCE(
            MAX(
                CASE
                    WHEN stat_baloti.data <= '2024-02-01 23:59:00' THEN stat_baloti.nrBalot
                END
            ),
            MIN(
                CASE
                    WHEN stat_baloti.data >= '2024-02-01 23:59:00' THEN stat_baloti.nrBalot
                END
            )
        ) - COALESCE(
            MAX(
                CASE
                    WHEN stat_baloti.data < '2024-02-01 01:00:00' THEN stat_baloti.nrBalot
                END
            ),
            MIN(
                CASE
                    WHEN stat_baloti.data > '2024-02-01 01:00:00' THEN stat_baloti.nrBalot
                END
            )
        ),
        0
    ) AS 'feb. 2024',
    COALESCE(
        COALESCE(
            MAX(
                CASE
                    WHEN stat_baloti.data <= '2024-02-01 23:59' THEN stat_baloti.nrBalot
                END
            ),
            MIN(
                CASE
                    WHEN stat_baloti.data >= '2024-02-01 23:59' THEN stat_baloti.nrBalot
                END
            )
        ) - COALESCE(
            MAX(
                CASE
                    WHEN stat_baloti.data < '2024-01-31 00:00' THEN stat_baloti.nrBalot
                END
            ),
            MIN(
                CASE
                    WHEN stat_baloti.data > '2024-01-31 00:00' THEN stat_baloti.nrBalot
                END
            )
        ),
        0
    ) AS blc
FROM
    devices
    LEFT JOIN stat_baloti ON devices.mac = stat_baloti.mac
    AND stat_baloti.data BETWEEN '2024-01-31 00:00' AND '2024-02-01 23:59'
WHERE
    devices.mac IN ('80646FA92AC7')
GROUP BY
    devices.mac
ORDER BY
    devices.nrmag ASC;

SELECT devices.mac,devices.nrmag,devices.magazin,
COALESCE(
         COALESCE(MAX(CASE WHEN stat_baloti.data <= '2024-01-30 23:59:00' THEN stat_baloti.nrBalot END), 
          MIN(CASE WHEN stat_baloti.data >= '2024-01-30 23:59:00' THEN stat_baloti.nrBalot END)) -
         COALESCE(MAX(CASE WHEN stat_baloti.data < '2024-01-30 00:00:00' THEN stat_baloti.nrBalot END), 
          MIN(CASE WHEN stat_baloti.data > '2024-01-30 00:00:00' THEN stat_baloti.nrBalot END)),
         0
       ) AS 'ian. 2024',
COALESCE(
         COALESCE(MAX(CASE WHEN stat_baloti.data <= '2024-01-30 23:59' THEN stat_baloti.nrBalot END), 
          MIN(CASE WHEN stat_baloti.data >= '2024-01-30 23:59' THEN stat_baloti.nrBalot END)) -
         COALESCE(MAX(CASE WHEN stat_baloti.data < '2024-01-30 00:00' THEN stat_baloti.nrBalot END), 
          MIN(CASE WHEN stat_baloti.data > '2024-01-30 00:00' THEN stat_baloti.nrBalot END)),
         0
       ) AS blc
           FROM devices 
           LEFT JOIN stat_baloti ON devices.mac = stat_baloti.mac AND 
           stat_baloti.data BETWEEN '2024-01-30 00:00' AND '2024-01-30 23:59'
           WHERE
               devices.mac IN ('80646FAE080A', '80646FA92A88')
           GROUP BY devices.mac ORDER BY devices.nrmag ASC; 

SELECT devices.mac,
COALESCE(
         COALESCE(MAX(CASE WHEN stat_baloti.data <= '2024-01-30 23:59' THEN stat_baloti.nrBalot END), 
          MIN(CASE WHEN stat_baloti.data >= '2024-01-30 23:59' THEN stat_baloti.nrBalot END)) -
         COALESCE(MAX(CASE WHEN stat_baloti.data < '2024-01-30 00:00' THEN stat_baloti.nrBalot END), 
          MIN(CASE WHEN stat_baloti.data > '2024-01-30 00:00' THEN stat_baloti.nrBalot END)),
         0
       ) AS blc
           FROM devices 
           LEFT JOIN stat_baloti ON devices.mac = stat_baloti.mac AND 
           stat_baloti.data BETWEEN '2024-01-30 00:00' AND '2024-01-30 23:59'
           WHERE
               devices.mac IN ('80646FAE080A', '80646FA92A88')
           GROUP BY devices.mac ORDER BY devices.nrmag ASC; 





SELECT devices.*, 
     SEC_TO_TIME(SUM(TIME_TO_SEC(CASE WHEN stat_erori.eroare > 10 THEN stat_erori.durata ELSE '00:00:00' END))) AS downtime,
     COALESCE(baloti_counts.blc, 0) AS blc,
     COUNT(CASE WHEN stat_erori.eroare < 11 THEN 1 END) AS minore,
     COUNT(CASE WHEN stat_erori.eroare > 10 THEN 1 END) AS majore,
     CASE
       WHEN nr_eroare<10 THEN 'Personal Kaufland'
       WHEN nr_eroare>10 THEN 'Furnizor Service'
       ELSE ' '
     END AS responsabil,
     CASE
       WHEN CURDATE() > DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY) AND nrBaloti > intervalBaloti + balotiRevizie THEN CONCAT('Depasita <br>(', DATEDIFF(CURDATE(), DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY)), ' zile, ', nrBaloti - (intervalBaloti + balotiRevizie), ' baloti)')
       WHEN CURDATE() > DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY) THEN CONCAT('Depasita <br>(', DATEDIFF(CURDATE(), DATE_ADD(dataRevizie, INTERVAL intervalRevizie DAY)), ' zile)')
       WHEN nrBaloti > intervalBaloti + balotiRevizie THEN CONCAT('Depasita <br>(', nrBaloti - (intervalBaloti + balotiRevizie), ' baloti)')
       ELSE 'In termen'
     END AS revizie
         FROM devices 
         LEFT JOIN (SELECT sb.mac AS mac,
            -(IFNULL((SELECT MAX(nrBalot) FROM stat_baloti sb1 WHERE sb1.mac = sb.mac AND sb1.data < '2024-02-01 00:00'),
            (SELECT MIN(nrBalot) FROM stat_baloti sb1 WHERE sb1.mac = sb.mac)) - 
            IFNULL((SELECT MAX(nrBalot) FROM stat_baloti sb2 WHERE sb2.mac = sb.mac AND sb2.data < '2024-02-29 23:59'),
            (SELECT MIN(nrBalot) FROM stat_baloti sb2 WHERE sb2.mac = sb.mac))) 
            AS blc 
            FROM (SELECT DISTINCT mac FROM stat_baloti) sb) AS baloti_counts ON devices.mac = baloti_counts.mac
         LEFT JOIN avertizari ON devices.mac = avertizari.mac AND avertizari.stadiu<3
         LEFT JOIN stat_erori ON devices.mac = stat_erori.mac AND stat_erori.data BETWEEN '2024-02-01 00:00' AND '2024-02-29 23:59'
         GROUP BY devices.mac
         ORDER BY devices.nrmag DESC