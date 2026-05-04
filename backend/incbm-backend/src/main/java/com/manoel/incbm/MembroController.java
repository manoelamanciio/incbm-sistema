package com.manoel.incbm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/membros")
@CrossOrigin(origins = "*")
public class MembroController {

    @Autowired
    private MembroRepository repository;

    // LISTAR
    @GetMapping
    public List<Membro> listar() {
        return repository.findAll();
    }

    // SALVAR
    @PostMapping
    public Membro salvar(@RequestBody Membro m) {
        return repository.save(m);
    }

    // ATUALIZAR
    @PutMapping("/{id}")
    public Membro atualizar(@PathVariable Long id, @RequestBody Membro m) {
        m.setId(id);
        return repository.save(m);
    }

    // DELETAR
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}